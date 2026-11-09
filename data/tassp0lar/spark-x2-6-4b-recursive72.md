# TassP0lar/Spark-X2.6-4B-Recursive72

## Resumen

Spark X2.6 4B Recursive72 es una variante experimental del modelo base XHToken/Spark-X2.6-4B, publicada por el usuario TassP0lar en Hugging Face. Se trata de un fine-tuning que mantiene congelado el backbone BF16 original de 36 capas y le superpone un esquema de recurrencia en profundidad de 72 visitas (Loop72), junto con atención dispersa latente paginada por visita (D-LSA) y controladores TwoStreamMHC diferenciables. El objetivo declarado es explorar técnicas de cómputo recurrente y atención eficiente sobre un transformer híbrido ya entrenado, sin reentrenar los pesos base.

El modelo conserva los 4.112.079.360 parámetros del backbone original (aproximadamente 4B) y añade 10.078.176 parámetros en los controladores MHC, lo que sitúa el total ligeramente por encima de los 4,12 mil millones. La arquitectura base combina 9 capas de atención completa con 27 capas de ventana deslizante, una configuración híbrida orientada a contextos largos y a un coste de atención reducido.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin model card completa ni datos de benchmarks. Resulta útil como referencia de técnicas de recurrencia y atención dispersa aplicadas a un modelo open source, pero no está pensado para producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (9 capas de atención completa + 27 de ventana deslizante) con recurrencia en profundidad Loop72 y atención dispersa D-LSA |
| Parametros totales | 4.112.079.360 (backbone) + 10.078.176 (controladores MHC) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el tag long-context sugiere soporte extendido, sin cifra publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16 en el backbone; repo de 8,3 GB) |

## Arquitectura y entrenamiento

El backbone es XHToken/Spark-X2.6-4B, un transformer híbrido de 36 capas físicas: 9 capas de atención completa y 27 capas de ventana deslizante, con activación GELU nativa y pesos congelados en BF16. Sobre esta base, el autor aplica un esquema de recurrencia en profundidad de 72 visitas distribuidas en cinco tramos: preludio L0–L3 (4 visitas), primera pasada del núcleo L4–L27 (24 visitas), segunda pasada del núcleo L4–L27 (24 visitas), tercera pasada interna L12–L23 (12 visitas) y coda L28–L35 (8 visitas), sumando 4 + 24 + 24 + 12 + 8 = 72.

Los controladores TwoStreamMHC (10.078.176 parámetros) son diferenciables y utilizan un esquema de ganancia acotada (gain_mode='sigmoid', mhc_schema_version=2) que garantiza que la matriz (1 − g)I + gP permanezca en la bola unitaria B2 en las 60 visitas del núcleo. Las ganancias medias reportadas son 0,009997 y 0,010014 para atención y FFN en la segunda pasada, y 0,004999 y 0,005004 en la tercera. La atención dispersa se gestiona mediante un VisitAwareDLSAIndexBank de 18 visitas, con proyecciones (W_k, W_q) en S^63 destiladas sobre el flujo residual learned_mhc entrenado, y un checkpoint MHC bloqueado con SHA-256 7cad7ffc33e7962f445a037f8dddb42b5250da30d1782c8f76c4138c42057456.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta variante. El modelo base Spark-X2.6, según su repositorio GitHub, mantiene la misma arquitectura que Spark-X2.5 y obtiene sus mejoras mediante post-entrenamiento, con avances en código, agentes, contexto largo, multilingüismo y razonamiento.

## Capacidades

- Generación de texto conversacional: pipeline declarado text-generation con plantilla de chat en el modelo base.
- Razonamiento y código: heredados del post-entrenamiento de Spark-X2.6 según la documentación del repositorio base.
- Contexto largo: el tag long-context y la combinación de capas de ventana deslizante con atención dispersa D-LSA apuntan a esta capacidad, aunque no se publica la longitud exacta soportada.
- Soporte multilingüe: el modelo base lo declara, pero esta variante no especifica idiomas.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el pipeline es únicamente de texto.
- Carga personalizada: requiere el script load_inference_v03.py y el flag trust_remote_code para inicializar la recurrencia y la atención dispersa.

## Casos de uso

- Investigación en recurrencia en profundidad: el modelo sirve como banco de pruebas para estudiar cómo afecta un esquema Loop72 con ganancias acotadas al comportamiento de un transformer congelado, comparando las salidas con el backbone original.
- Experimentos de atención dispersa: el VisitAwareDLSAIndexBank permite analizar el impacto de la atención latente paginada por visita en tareas de contexto largo, sin necesidad de reentrenar el backbone.
- Evaluación de controladores MHC: los 10 millones de parámetros de TwoStreamMHC pueden estudiarse de forma aislada para entender cómo modulan las pasadas recurrentes sobre el flujo residual.
- Reproducción de pipelines de carga personalizada: el script load_inference_v03.py y el manifiesto de ejecución (execution_manifest) son útiles para validar despliegues con custom_code en transformers.
- Generación de texto conversacional en entornos de laboratorio: al heredar el pipeline text-generation y la plantilla de chat del modelo base, puede emplearse para pruebas controladas de diálogo multi-turno.
- Docencia y divulgación: como ejemplo práctico de técnicas avanzadas (recurrencia, atención dispersa, controladores diferenciables) aplicadas a un modelo open source de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8,5–9 GB solo para pesos (4,12B parámetros × 2 bytes), más overhead de activaciones, caché KV y las estructuras D-LSA; se recomienda al menos 16 GB para margen.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se documentan recetas de cuantización para esta variante.
- GPU recomendadas: A100 40/80 GB o H100 para experimentación con contexto largo y lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con lote pequeño.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización agresiva, en GPUs de 12 GB, siempre que el código personalizado lo permita.
- Opciones de despliegue: transformers con trust_remote_code y el script load_inference_v03.py; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza custom_code dificulta su integración directa.
- Latencia y throughput: no disponibles; el esquema Loop72 multiplica el cómputo efectivo respecto a una pasada única del backbone, por lo que la latencia será sustancialmente mayor que la del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TassP0lar/Spark-X2.6-4B-Recursive72 | ~4,12B | no disponible | no disponible | Hugging Face, 0 descargas | Variante experimental con Loop72 y D-LSA |
| XHToken/Spark-X2.6-4B (base) | ~4B | no disponible | no disponible | Hugging Face | Backbone congelado del que deriva esta variante |
| TassP0lar/Spark-X2.6-4B-En4B-A1B | ~4B | no disponible | no disponible | Hugging Face, 51 descargas | Otra variante del mismo autor sobre el mismo backbone |

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.
- Sin licencia declarada: no se puede asumir uso comercial sin consultar al autor y al modelo base.
- Sin idiomas declarados ni datos de sesgos o alucinación; se desconoce su comportamiento fuera del inglés o en dominios sensibles.
- Requiere código personalizado (custom_code, load_inference_v03.py) y confiar en el repositorio remoto; esto implica riesgos de seguridad y de compatibilidad con versiones de transformers.
- La recurrencia Loop72 incrementa el coste computacional por token en comparación con el backbone de una sola pasada; la latencia puede ser prohibitiva para aplicaciones interactivas.
- No se publican resultados de benchmarks ni comparaciones con el modelo base, por lo que no se puede verificar que la recurrencia aporte mejoras.
- El checkpoint MHC está bloqueado por SHA-256; cualquier modificación de los pesos o del script puede romper la carga.
- La longitud de contexto real no está documentada pese al tag long-context; conviene validarla empíricamente antes de confiar en ventanas extensas.

## Enlaces

- Hugging Face: https://huggingface.co/TassP0lar/Spark-X2.6-4B-Recursive72
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio GitHub del modelo base: https://github.com/XHToken/Spark-X2.6
- Variante relacionada del mismo autor: https://huggingface.co/TassP0lar/Spark-X2.6-4B-En4B-A1B
