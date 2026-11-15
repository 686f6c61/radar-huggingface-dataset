# Wizzas/DefectRAG

## Resumen

DefectRAG es un sistema de inspección visual industrial publicado por el usuario Wizzas en Hugging Face, cuyo código fuente también está disponible en GitHub. No se trata de un modelo de lenguaje único, sino de un pipeline completo que combina un modelo de visión DINOv2 afinado para detección de defectos con un asistente basado en recuperación aumentada (RAG) construido sobre Qwen2.5-3B, afinado con QLoRA. El repositorio de Hugging Face contiene únicamente el código fuente del proyecto, no pesos del modelo, y ocupa 0.0 GB.

El sistema resuelve un problema concreto: dada una fotografía de un producto, determinar si su apariencia es anómala, señalar las regiones sospechosas y responder preguntas sobre el resultado citando documentos atribuidos del proyecto. Para ello compara cada imagen con una memoria de imágenes normales del mismo producto y calcula puntuaciones de diferencia respecto al vecino normal más cercano, aplicando una regla de umbral única.

La relevancia actual reside en su enfoque de "evidencia fundamentada": el asistente no genera respuestas libres, sino que cita fragmentos de documentos verificados antes de mostrarlos al usuario. El proyecto reporta métricas de inspección de 0.971 AUROC medio por imagen en VisA y 0.992 en MVTec AD, e incluye una demo en vivo en Hugging Face Spaces y una vitrina alojada en AWS Lightsail.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: DINOv2 (visión) + Qwen2.5-3B (LLM) con RAG sobre BGE |
| Parametros totales | No disponible (el LLM base es Qwen2.5-3B; el repo no contiene pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona QLoRA para el afinado del LLM) |
| Idiomas soportados | No disponible |
| Licencia | MIT para la aplicación; licencia del modelo no disponible |
| Formato de pesos | No disponible (el repositorio contiene código fuente, 0.0 GB) |

## Arquitectura y entrenamiento

El componente de visión es un DINOv2 afinado que extrae características sobre 12 productos del conjunto VisA. La detección se basa en puntuaciones de diferencia respecto al vecino normal más cercano, con una regla de umbral única, en lugar de un clasificador supervisado de defectos. El componente de lenguaje es un Qwen2.5-3B afinado con QLoRA, integrado en un flujo LangGraph que enruta consultas, genera respuestas y verifica las citas antes de mostrarlas. La recuperación se realiza con BGE sobre documentos atribuidos del proyecto.

El sistema completo se apoya en una pila técnica concreta: Python 3.12, PyTorch 2.8.0, FastAPI 0.142.2, LangChain 1.6.10, LangGraph 1.2.14, Gradio 6.30.0, React 19.3.1 y Vite 6.4.5. La autenticación, el control de acceso por filas y el almacenamiento se delegan en Supabase, con MFA TOTP nativo. Las notificaciones de acciones correctivas se envían mediante n8n sobre AWS. El proyecto declara 510 tests en verde (284 de frontend y 226 de backend) y flujos de CI y release en GitHub Actions.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de afinado del LLM ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Inspección visual de productos: detección de apariencia anómala sobre imágenes, con localización de las regiones que no coinciden con la memoria de imágenes normales.
- Puntuación de diferencia: cálculo de una puntuación numérica de desviación respecto al vecino normal más cercano y aplicación de un umbral configurable.
- Asistente fundamentado en evidencia: respuestas generadas por Qwen2.5-3B con citas textuales extraídas de documentos atribuidos y verificación de citas antes de su presentación.
- Recuperación aumentada: búsqueda sobre documentos del proyecto mediante BGE y enrutado de consultas con LangGraph.
- Gestión de casos: conversión de defectos confirmados en acciones correctivas con responsable, fecha límite y notificaciones por correo.
- Revisión en equipo: autenticación con Supabase, control de acceso por filas y MFA TOTP para revisiones privadas.
- Interfaz dual: demo en Gradio y panel en React con comparación de imagen original frente a regiones resaltadas.

## Casos de uso

- Inspección de calidad en línea de producción: el operario fotografía cada pieza y el sistema compara con la memoria de normales del mismo producto, devolviendo una puntuación de diferencia y las regiones sospechosas para revisión humana.
- Control de recepción de materiales: verificación rápida de lotes entrantes frente a imágenes de referencia, con umbral ajustable según la tolerancia del proveedor.
- Asistencia al operario con explicaciones: ante una anomalía detectada, el asistente responde preguntas sobre el resultado citando documentos atribuidos del proyecto, lo que permite justificar la decisión sin depender de conocimiento tácito.
- Gestión de acciones correctivas: los defectos confirmados se convierten en acciones con responsable y fecha límite, y se notifican por correo mediante n8n, cerrando el ciclo de calidad.
- Auditoría y trazabilidad: el registro de inspecciones, resultados y citas permite reconstruir por qué se aceptó o rechazó una pieza en una revisión posterior.
- Despliegue de demos internas: la combinación de Gradio y FastAPI permite publicar una demo funcional en Hugging Face Spaces o en una instancia AWS Lightsail con HTTPS para validación con stakeholders.
- Formación de personal: la guía de personal incluida y las explicaciones citadas sirven como material de onboarding para nuevos revisores de calidad.

## Benchmarks y rendimiento

| Conjunto de datos | Métrica | Resultado |
|---|---|---|
| VisA | AUROC medio por imagen | 0.971 |
| MVTec AD | AUROC medio por imagen | 0.992 |

No se han publicado en la información disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) ni comparativas con otros sistemas de inspección visual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El componente de lenguaje es un Qwen2.5-3B, que en cuantización de 4 bits requiere del orden de 2-3 GB, pero este dato no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la pila declarada incluye FastAPI, Gradio, LangChain, LangGraph, Supabase y n8n; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros sistemas de inspección visual industrial ni con modelos de lenguaje de tamaño comparable, y el repositorio no contiene pesos que permitan una comparación directa.

## Limitaciones y advertencias

- El repositorio de Hugging Face contiene únicamente código fuente (0.0 GB); no incluye pesos del modelo, por lo que no puede usarse directamente como modelo preentrenado.
- La licencia MIT se declara para la aplicación, pero la licencia de los pesos subyacentes (DINOv2 y Qwen2.5-3B) no se especifica en la información disponible; conviene verificar las licencias de los modelos base antes de un uso comercial.
- El sistema depende de una memoria de imágenes normales por producto; su rendimiento fuera de los 12 productos de VisA o de MVTec AD no está documentado.
- La detección se basa en una regla de umbral única, lo que puede requerir ajuste por producto y no se describe un mecanismo automático de calibración.
- El asistente está diseñado para citar documentos atribuidos y verificar citas; aun así, el riesgo de alucinación en la generación de Qwen2.5-3B no puede descartarse y la verificación de citas es una mitigación, no una garantía.
- No se documentan sesgos conocidos, cobertura idiomática ni comportamiento en dominios distintos a la inspección visual industrial.
- El proyecto depende de servicios externos (Supabase, n8n, AWS Lightsail), lo que introduce requisitos operativos y de coste no detallados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Wizzas/DefectRAG
- Código fuente en GitHub: https://github.com/WAYTECHG/DefectRAG
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Wizzas/DefectRAG
- Vitrina alojada en AWS Lightsail: https://defectrag.duckdns.org
- Guía de personal: docs/STAFF_QUICK_GUIDE.md (dentro del repositorio de GitHub)
- Flujo de CI: https://github.com/WAYTECHG/DefectRAG/actions/workflows/ci.yml
- Flujo de release: https://github.com/WAYTECHG/DefectRAG/actions/workflows/release.yml
