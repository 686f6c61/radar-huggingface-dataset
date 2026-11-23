# Valen-Team/Valen-Decision-1.5-2B

## Resumen

Valen-Decision-1.5-2B es un modelo de decisión multimodal desarrollado por Valen-Team, un fine-tune del modelo base Qwen/Qwen3.5-2B. A diferencia de los modelos generativos convencionales, su propósito no es producir texto libre, sino responder preguntas estructuradas sobre una entrada (texto, imagen o vídeo) devolviendo probabilidades para predicados, elecciones y puntuaciones, además de cajas delimitadoras (bounding boxes) para preguntas de localización. Está pensado para tareas de clasificación, enrutamiento y verificación en producción.

El modelo incorpora dos innovaciones técnicas destacables: atención bidireccional por bloques (block-bidirectional attention) y una cabeza de grounding de bounding boxes, de modo que una sola pasada hacia delante devuelve tanto probabilidades como coordenadas. Con 2.220.085.357 parámetros (aproximadamente 2,2B), se distribuye bajo licencia Apache 2.0 y está disponible en tres formatos: pesos nativos para Transformers, ONNX y GGUF para el runtime Valen llama.cpp 0.2.0.

La familia Valen-Decision-1.5 se publica en cinco tamaños (0.8B, 2B, 4B, 9B y 27B), donde los modelos mayores obtienen mejores puntuaciones en el llamado Decision Index. Este modelo de 2B ocupa la franja intermedia-baja y resulta relevante ahora por su enfoque en salidas tipadas y estructuradas, orientado a integrarse en pipelines de decisión automatizados más que en asistentes conversacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 con atención bidireccional por bloques y cabeza de grounding de bounding boxes |
| Parámetros totales | 2.220.085.357 (≈2,2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (backbone) y FP32 (cabezas de decisión y grounding) en pesos nativos; GGUF para runtime Valen llama.cpp 0.2.0; ONNX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-2B, un transformer de aproximadamente 2,2B parámetros, y le añade dos componentes específicos: atención bidireccional por bloques y una cabeza de grounding de bounding boxes. La atención bidireccional por bloques permite que ciertas representaciones atiendan en ambas direcciones dentro de bloques definidos, algo útil para tareas de clasificación y verificación donde la decisión depende del conjunto de la entrada y no de una generación autoregresiva. La cabeza de grounding produce coordenadas de caja para cada pregunta de tipo bbox. Los pesos nativos almacenan el backbone en BF16 y las cabezas de decisión y grounding en FP32.

El modelo se presenta como fine-tune del base Qwen3.5-2B, pero la model card indica explícitamente que los datos de entrenamiento de Valen-Decision-1.5 no son públicos. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor publica el código de entrenamiento en su repositorio de GitHub, lo que permite reentrenar o ajustar el modelo sobre datos propios.

## Capacidades

- Clasificación de mensajes de cliente mediante preguntas de tipo predicado (presencia de un concepto) y de elección (selección entre opciones).
- Verificación de imágenes contra requisitos definidos, devolviendo probabilidades por pregunta.
- Identificación de acciones en vídeos.
- Localización visual mediante preguntas de tipo bbox, con salida de cajas delimitadoras en la misma pasada.
- Salida estructurada y tipada: probabilidades para predicados, elecciones y puntuaciones, más cajas para preguntas de grounding.
- Soporte de dos formatos de API de decisión: SystemOne (usado por Jev) y Decisions (usado por OpenAI).
- Interfaz de predicción mediante `model.predict()` con preguntas definidas por el usuario.
- Capacidad multimodal de entrada imagen-texto (pipeline image-text-to-text).
- No se documenta soporte de tool calling genérico, razonamiento multi-paso libre ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del mensaje y una batería de preguntas de elección (categoría, urgencia, idioma) y devuelve probabilidades que permiten asignar el ticket al equipo adecuado. El Cookbook oficial incluye un tutorial específico de ticket routing.
- Cribado de imágenes de producto: se envían imágenes de catálogo junto con preguntas de predicado (fondo blanco, producto centrado, sin texto superpuesto) y el modelo devuelve la probabilidad de cumplimiento de cada requisito, tal como se describe en el tutorial product screening.
- Etiquetado de vídeo: identificación de acciones presentes en fragmentos de vídeo mediante preguntas de predicado y elección, útil para indexación y moderación de contenido.
- Verificación de contenidos generados: comprobación automática de si una imagen o texto cumple una política antes de publicarse, usando las probabilidades como umbral de aceptación.
- Moderación y control de calidad: clasificación de mensajes o imágenes contra criterios definidos, con la probabilidad como señal calibrable para decidir revisión humana.
- Extracción de regiones de interés: uso de preguntas bbox para localizar objetos concretos en una imagen y alimentar pipelines posteriores de recorte, OCR o análisis.
- Integración en producción sin GPU: gracias a las variantes ONNX y GGUF y al runtime Valen llama.cpp, puede desplegarse en entornos con recursos limitados o en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un "Decision Index" como métrica propia de la familia, con mejores puntuaciones en los tamaños mayores, pero no se proporcionan valores numéricos para este modelo de 2B.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 4,5 GB solo para pesos (el repositorio ocupa 4,5 GB), más overhead de activaciones y del runtime; se recomienda al menos 8 GB de VRAM para trabajar con holgura.
- En FP32 las cabezas de decisión y grounding añaden una carga pequeña adicional, ya contemplada en el tamaño del repositorio.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3070/4070 o superiores; A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, ONNX Runtime y el runtime Valen llama.cpp 0.2.0 con pesos GGUF.
- Latencia y throughput: no disponibles. El modelo requiere `attn_implementation="sdpa"` y desactivar TF32 en cuDNN según la guía de inicio rápido del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| Valen-Decision-1.5-2B | 2,2B | no disponible | Decisión estructurada multimodal con grounding | Apache 2.0 | safetensors, ONNX, GGUF |
| Valen-Decision-1.5-0.8B | 0,8B | no disponible | Decisión estructurada multimodal | Apache 2.0 | safetensors, ONNX, GGUF |
| Valen-Decision-1.5-4B | 4B | no disponible | Decisión estructurada multimodal | Apache 2.0 | safetensors, ONNX, GGUF |
| Qwen/Qwen3.5-2B | ≈2B | no disponible | Generación de texto multimodal | no disponible en esta ficha | no disponible en esta ficha |

Los tamaños 0.8B, 4B, 9B y 27B de la misma familia son las alternativas más directas: los mayores obtienen mejor Decision Index a cambio de más memoria y cómputo. El modelo base Qwen3.5-2B es el punto de partida del fine-tune, pero no es un sustituto funcional, ya que no ofrece salidas de decisión tipadas ni grounding. No se dispone de datos de benchmarks para comparar rendimiento numérico entre estas opciones.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: está diseñado para responder preguntas estructuradas y no debe esperarse de él conversación abierta ni razonamiento multi-paso.
- Los datos de entrenamiento no son públicos, lo que impide auditar la composición del dataset y los posibles sesgos adquiridos.
- No se documentan los idiomas soportados; conviene validar el comportamiento en castellano antes de usarlo en producción.
- No se publican resultados de benchmarks ni métricas de calibración, por lo que los umbrales de probabilidad deben calibrarse empíricamente sobre datos propios.
- Riesgo de alucinación en las probabilidades: al ser salidas de un modelo neuronal, pueden ser excesivamente confiadas en entradas fuera de distribución.
- La longitud de contexto no está documentada, lo que limita la planificación de entradas largas.
- Requiere `trust_remote_code=True` y ejecución de código personalizado del autor, lo que implica revisar el código antes de desplegarlo en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B y de los assets y demos del repositorio.
- El modelo se apoya en el runtime propietario Valen llama.cpp 0.2.0 para los pesos GGUF, lo que añade una dependencia específica del ecosistema del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Variante ONNX: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-ONNX
- Variante GGUF: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-GGUF
- Modelo 0.8B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Modelo 4B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Modelo 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Modelo 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de código y entrenamiento: https://github.com/Valen-Team/Valen
- Demo web y API gratuita: https://valen-team.github.io/
- Space de playground: https://huggingface.co/spaces/Valen-Team/Valen-API
- Cookbook: https://valen-team.github.io/cookbook/
- Documentación de Transformers: https://valen-team.github.io/docs/valen/quickstart/
- Documentación de la API: https://valen-team.github.io/docs/valen/api/
- Tutorial de ticket routing: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de productos: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de vídeo: https://valen-team.github.io/cookbook/video-tagging/
- Demostración en vídeo: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
- Formato SystemOne de Jev: https://docs.typesafe.ai/api/system-one
- Formato Decisions de OpenAI: https://developers.openai.com/api/docs/guides/decisions
