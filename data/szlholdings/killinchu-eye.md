# SZLHOLDINGS/KILLINCHU-EYE

## Resumen

KILLINCHU-EYE es un repositorio de Hugging Face publicado por SZLHOLDINGS que, según su propia model card, no contiene ningún modelo entrenado. Se trata de una **reserva de nombre** (alias) y un marcador de posición en estado ROADMAP, sin pesos, sin checkpoints y sin artefactos de inferencia. El repositorio apunta a `SZLHOLDINGS/waman` como destino del alias, que también está en estado ROADMAP y sin entrenar.

El proyecto killinchu, descrito en el repositorio de GitHub asociado, es una herramienta de borde (edge) para contra-UAS (sistemas aéreos no tripulados hostiles) que pretende detectar, clasificar y evaluar pistas de UAS a velocidad de máquina, firmando cada decisión de interdicción con un recibo DSSE Khipu. Sin embargo, en el momento de la consulta no existe ningún modelo de detección publicado, ni pesos, ni resultados de entrenamiento. La ficha que sigue documenta el estado real del repositorio y sus limitaciones, sin atribuir capacidades que no están demostradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sin modelo publicado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura declarada ni datos de entrenamiento. La model card indica explícitamente `trained: false`, `weights: none` y `status: ROADMAP`. El repositorio contiene únicamente el archivo README. No se ha publicado información sobre dataset, tokens, método de entrenamiento (RLHF, DPO, etc.) ni ninguna innovación técnica aplicada a un modelo real. El proyecto killinchu, en su documentación de GitHub, menciona un "motor de reglas contra-UAS con gobernanza Λ-gate" y "estructuras de recibo Khipu", pero estos conceptos pertenecen al diseño del sistema de gobernanza, no a un modelo de aprendizaje automático entrenado.

## Capacidades

- **Ninguna capacidad de inferencia**: no hay modelo que cargar, ejecutar o consultar. No genera texto, no procesa imágenes, no detecta objetos.
- **Detección de UAS (conceptual)**: el proyecto killinchu describe la intención de detectar y clasificar pistas de UAS hostiles, pero no existe implementación publicada.
- **Firma de decisiones (conceptual)**: se menciona un sistema de recibos DSSE Khipu para auditar decisiones de interdicción, pero no hay código ni artefactos disponibles en el repositorio de Hugging Face.
- **Gobernanza y control**: la documentación habla de un "Λ-gate" de 13 ejes y un quórum BFT 3-de-4, pero todo ello es especificación de diseño, no funcionalidad operativa.

## Casos de uso

Dado que no hay modelo entrenado, los casos de uso son **potenciales** y dependen de que se publiquen pesos en el futuro. No deben considerarse aplicaciones actuales.

- **Vigilancia de perímetros críticos**: si se entrenara un detector, podría usarse para monitorizar instalaciones sensibles (aeropuertos, centrales eléctricas) y alertar de drones no autorizados. Hoy no es posible.
- **Integración en sistemas de defensa C-UAS**: el diseño contempla la firma de cada decisión con un recibo auditable, lo que permitiría trazar acciones de interdicción. Sin pesos, no hay sistema que integrar.
- **Análisis forense de incursiones de drones**: la clasificación de pistas podría alimentar informes post-incidente. Requiere un modelo funcional.
- **Automatización de respuesta con supervisión humana**: la documentación menciona que la decisión se muestra a un operador antes de propagar la acción. Es un flujo de trabajo deseado, no implementado.
- **Investigación académica sobre gobernanza de IA**: el repositorio puede servir como caso de estudio de cómo documentar la ausencia de modelo y evitar reclamaciones falsas de rendimiento.
- **Pruebas de integración de pipelines de MLOps**: el repositorio puede usarse para verificar que un sistema de descarga de modelos maneja correctamente repositorios vacíos o en estado ROADMAP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente: "Do not claim mAP". No hay métricas de precisión, recall, IoU, latencia ni throughput.

## Requisitos de hardware

- **VRAM**: no aplicable, no hay modelo que ejecutar.
- **GPU recomendadas**: ninguna.
- **Compatibilidad con GPU de consumo**: no aplicable.
- **Opciones de despliegue**: no hay artefactos para vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No existe comparativa posible porque no hay modelo. Los sistemas de detección de objetos como YOLO, DETR o RT-DETR son alternativas reales con pesos publicados, pero no son comparables a un repositorio vacío. La propia model card menciona que no hay pesos de Roboflow, YOLO ni transformers. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **No es un modelo funcional**: no contiene pesos, no puede cargarse ni usarse para inferencia.
- **Riesgo de confusión**: el nombre y los tags sugieren un detector de visión, pero el repositorio es solo una reserva de nombre. Cualquier uso como modelo real fallará.
- **Sin garantías de rendimiento**: no hay métricas, benchmarks ni validación. No se debe reclamar ningún valor de mAP ni de precisión.
- **Licencia Apache-2.0**: permite uso comercial del código y la documentación, pero no hay código de modelo que usar.
- **Estado de desarrollo incierto**: la fecha de creación (2026-08-28) y actualización (2026-09-02) son futuras respecto a la fecha de esta ficha, lo que sugiere que el proyecto puede estar en una fase muy temprana o ser especulativo.
- **Advertencia de seguridad**: el repositorio ha sido indexado por herramientas de análisis de vulnerabilidades (Palo Alto Networks), pero no se ha identificado ningún exploit concreto. Aun así, no se recomienda confiar en este repositorio para ningún sistema en producción.

## Enlaces

- [Hugging Face: SZLHOLDINGS/KILLINCHU-EYE](https://huggingface.co/SZLHOLDINGS/KILLINCHU-EYE)
- [GitHub: szl-holdings/killinchu](https://github.com/szl-holdings/killinchu/blob/main/README.md)
- [Documentación del proyecto killinchu](https://holdings.a-11-oy.com/docs-site/flagships/killinchu.html)
- [Panel de gobernanza killinchu (demo)](https://szlholdings-killinchu.hf.space/elite)
- [Landing page de killinchu](https://szlholdings-killinchu.hf.space/landing.html)
- [Análisis de seguridad de Palo Alto Networks](https://insights-db.paloaltonetworks.com/models/SZLHOLDINGS/KILLINCHU-EYE/62cb37880a484b7b591c8c6f8231d73385b33995/overview)
