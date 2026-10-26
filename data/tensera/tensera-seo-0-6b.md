# Tensera/Tensera-SEO-0.6B

## Resumen

Tensera SEO 0.6B (v0.3) es un modelo de lenguaje de 751.632.384 parámetros (aproximadamente 0,75 mil millones) especializado en auditoría y remediación de SEO técnico, desarrollado por Tensera AI Research Lab. Se obtiene por destilación sobre `rasbt/qwen3-from-scratch-distill-checkpoints`, una reproducción desde cero de la arquitectura Qwen3, y se afina sobre instantáneas arquitectónicas reales de WordPress, Next.js, Astro, Shopify, WooCommerce y PHP propio.

El modelo no intenta resolver la detección de etiquetas (que el autor considera resuelta de forma determinista con expresiones regulares) sino la parte neuronal: generar parches de código correctos y razonar sobre dependencias arquitectónicas. Su salida es un JSON estructurado con metadatos de auditoría (`audit_meta`) y una lista de parches aplicables (`actionable_patches`), con una acción explícita `NO_ACTION` cuando la página no presenta defectos.

Su relevancia actual radica en el enfoque de validación: de 279 generaciones del modelo profesor (citado como "Gemini 4 Argon"), solo 171 (61,3 %) superaron cuatro validadores programáticos (grounding estricto de activos, linting físico con `php -l`, idiomaticidad de framework y guardrail anti falsos positivos). Es un caso poco habitual de model card que publica métricas de fallo del propio modelo, con un 27,3 % de éxito end-to-end estricto en arquetipos no vistos. Licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3, derivada de `rasbt/qwen3-from-scratch-distill-checkpoints`; no se documenta variante MoE |
| Parámetros totales | 751.632.384 (~0,75 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors y no se indica la precisión |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Versión | v0.3 |
| Tamaño del repositorio | 4,5 GB |
| Inferencia alojada en HF | No (`inference: false` en los metadatos) |
| Modelo base | `rasbt/qwen3-from-scratch-distill-checkpoints` |
| Fecha de publicación | 2026-10-26 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3, tomado de una reproducción educativa desde cero y afinado mediante destilación de un modelo profesor de frontera sobre cientos de instantáneas arquitectónicas reales. El entrenamiento no se plantea como generación libre de texto, sino como generación de objetos JSON con un esquema fijo: `audit_meta` (URL objetivo, stack detectado, estado de la arquitectura, acción, motivo y resumen) más `actionable_patches` y `safe_nuances_identified`.

La innovación principal está en el pipeline de filtrado previo al dataset, con cuatro validadores: (1) *strict grounding*, que exige que el 100 % de las URL de script, handles del DOM y assets de imagen referenciados en `fix_code` existan en la carga real de la página, rechazando nombres genéricos como `vendor-core.js`, `app-bundle.js` o `myscript.js`; (2) ejecución física de sintaxis con `php -l` sobre cada parche PHP; (3) idiomaticidad de framework, que prohíbe editar `includes/header.php` o ficheros core y exige hooks oficiales (`script_loader_tag`, `wp_enqueue_script` con `strategy => 'defer'`, `wp_get_attachment_image_attributes`, `
