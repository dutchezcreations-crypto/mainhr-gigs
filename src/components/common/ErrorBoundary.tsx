import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            maxWidth: "600px",
            width: "100%",
            border: "1px solid #f3f4f6"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <svg style={{ width: "28px", height: "28px", color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h1 style={{ color: "#111827", fontSize: "24px", marginBottom: "8px", fontWeight: "800" }}>
              Application Render Error
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "15px", lineHeight: "1.5" }}>
              A runtime exception occurred while loading the application. Below are the details of the crash:
            </p>
            <pre style={{
              backgroundColor: "#f9fafb",
              padding: "20px",
              borderRadius: "12px",
              overflowX: "auto",
              fontSize: "13px",
              textAlign: "left",
              color: "#374151",
              border: "1px solid #e5e7eb",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              maxHeight: "200px"
            }}>
              {this.state.error?.stack || this.state.error?.toString()}
            </pre>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "28px" }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
              >
                Reload Application
              </button>
              <button 
                onClick={() => window.location.href = "/"}
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
