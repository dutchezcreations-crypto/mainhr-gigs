"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  MoreVertical, 
  Star,
  Eye,
  MessageSquare
} from "lucide-react";
import styles from "./Services.module.css";
import Link from "next/link";

const services = [
  { id: 1, title: "I will design a modern fintech app UI", price: "UGX 450k", rating: 4.9, reviews: 24, views: "1.2k", status: "Published" },
  { id: 2, title: "I will conduct a full HR compliance audit", price: "UGX 800k", rating: 5.0, reviews: 12, views: "850", status: "Published" },
  { id: 3, title: "I will build a custom Node.js API", price: "UGX 600k", rating: 0, reviews: 0, views: "45", status: "Draft" },
];

export default function ServicesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Services</h1>
          <p className={styles.subtitle}>Manage your packaged service offerings and performance</p>
        </div>
        <Link href="/dashboard/services/create" className="btn btn-primary">
          <Plus size={18} /> Create a Service
        </Link>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Service Views</span>
          <span className={styles.statVal}>2,095</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Active Orders</span>
          <span className={styles.statVal}>3</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Avg. Rating</span>
          <span className={styles.statVal}>4.9</span>
        </div>
      </div>

      <div className={styles.grid}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.serviceImage}>
               <div className={styles.statusBadge}>{service.status}</div>
            </div>
            <div className={styles.serviceContent}>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <div className={styles.serviceMeta}>
                <div className={styles.rating}>
                  <Star size={14} fill="currentColor" />
                  <span>{service.rating > 0 ? service.rating : "New"}</span>
                  {service.reviews > 0 && <span className={styles.reviews}>({service.reviews})</span>}
                </div>
                <div className={styles.views}>
                  <Eye size={14} />
                  <span>{service.views}</span>
                </div>
              </div>
              <div className={styles.serviceFooter}>
                <span className={styles.price}>From {service.price}</span>
                <button className={styles.moreBtn}><MoreVertical size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
