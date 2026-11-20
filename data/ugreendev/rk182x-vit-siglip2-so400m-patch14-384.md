# UGREENDEV/RK182X-VIT-siglip2-so400m-patch14-384

## Resumen

RK182X-VIT-siglip2-so400m-patch14-384 es una conversión al formato RKNN del codificador visual de Google SigLIP 2, concretamente del checkpoint `google/siglip2-so400m-patch14-384`. Lo publica el usuario UGREENDEV y su propósito no es otro que el de permitir la ejecución del extractor de características visuales sobre las NPU Rockchip de la familia RK182X (chips RK1820 y RK1828). No se trata, por tanto, de un modelo nuevo, sino de un artefacto de despliegue derivado de los pesos originales.

El modelo base es un Vision Transformer de tipo SigLIP 2 con parches de 14x14 píxeles y resolución de entrada fija de 384x384. La conversión incluye únicamente el codificador de imagen: el codificador de texto del SigLIP 2 original no forma parte de este repositorio, de modo que el artefacto sirve para extracción de embeddings visuales, no para tareas de alineación imagen-texto completas.

Su relevancia es acotada pero práctica: permite llevar un extractor visual de calidad a hardware de borde con aceleración NPU, con dos variantes de cuantización (w4a16 y w6a16) y ocho núcleos NPU. Es un recurso de interés para quien despliegue pipelines de visión en dispositivos Rockchip, no para quien busque un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (SigLIP 2), parches 14x14, resolución fija 384x384 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (codificador visual sin texto; entrada de imagen 384x384) |
| Tipos de cuantizacion | w4a16 y w6a16 (pesos 4 o 6 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (solo codificador visual, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.1.0); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del codificador visual de SigLIP 2, un transformer de visión con tokenización por parches de 14x14 y una resolución de entrada fijada en 384x384 píxeles. El repositorio no documenta el número de capas, dimensión oculta ni número de parámetros del checkpoint original; esos datos corresponden a la model card de `google/siglip2-so400m-patch14-384`, que no se ha incluido en la información disponible.

El proceso de entrenamiento original tampoco se detalla aquí: no hay datos sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO, porque el artefacto publicado es una conversión, no un entrenamiento. La innovación técnica relevante en este repositorio es la propia conversión a RKNN: cuantización de pesos a 4 o 6 bits con activaciones en 16 bits, compilación para ocho núcleos NPU de los chips RK1820 y RK1828, y empaquetado con sumas de verificación SHA-256 para validar la integridad de los ficheros antes del despliegue. El runtime RKNN requerido es la versión v1.1.0.

## Capacidades

- Extracción de características visuales: genera embeddings de imagen a partir de entradas de 384x384 píxeles.
- Ejecución en NPU Rockchip: soporte para los chips RK1820 y RK1828 con ocho núcleos NPU.
- Dos perfiles de cuantización: w4a16 (menor huella) y w6a16 (mayor fidelidad numérica).
- Verificación de integridad: los directorios de configuración incluyen `SHA256SUMS` para validar los ficheros.
- Sin codificador de texto: no realiza búsqueda imagen-texto ni zero-shot classification por sí solo.
- Sin generación de texto, razonamiento, código, matemáticas, tool calling ni capacidades de agente.
- Sin soporte multilingüe: al carecer de torre de texto, no hay procesamiento de lenguaje.

## Casos de uso

- Búsqueda visual en dispositivos de borde: extraer embeddings de imágenes con el codificador SigLIP 2 en la NPU RK182X y compararlos por similitud coseno contra un índice vectorial precalculado, sin necesidad de GPU ni de conexión a la nube.
- Clasificación de imágenes por vecino más cercano: usar los embeddings como entrada a un clasificador k-NN o una regresión logística entrenada aparte, aprovechando que el codificador ya está cuantizado para el hardware objetivo.
- Deduplicación y agrupamiento de imágenes: calcular embeddings de un lote de imágenes y agruparlas por similitud para detectar duplicados o near-duplicates en un pipeline de ingesta.
- Filtrado previo en cámaras y dispositivos IoT: descartar fotogramas irrelevantes o detectar cambios de escena comparando embeddings consecutivos, con el bajo consumo que permite ejecutar el modelo en NPU.
- Recuperación multimodal con torre de texto separada: emparejar este codificador visual con un codificador de texto SigLIP 2 compatible ejecutado en otro backend, siempre que se respete la alineación del espacio de embeddings del modelo original.
- Control de calidad en líneas de producción: comparar la imagen capturada con una referencia mediante distancia de embeddings para detectar desviaciones, con verificación SHA-256 de los pesos antes de cada despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: chips Rockchip RK1820 y RK1828, con ocho núcleos NPU asignados a esta configuración.
- Runtime: RKNN Runtime v1.1.0 y driver compatible; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM: no aplica; el modelo se ejecuta en NPU, no en GPU. La memoria necesaria depende del perfil de cuantización (w4a16 o w6a16) y del tamaño del repositorio, 0,7 GB en total para ambas configuraciones.
- GPU: no soportado ni previsto; el artefacto es específico de NPU Rockchip.
- Despliegue: descarga vía `hf download` o `modelscope download`, verificación con `sha256sum -c SHA256SUMS` y ejecución con el runtime RKNN. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Hardware | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-VIT-siglip2-so400m-patch14-384 (este) | RKNN | NPU RK1820/RK1828 | w4a16, w6a16 | Apache 2.0 | Hugging Face y ModelScope |
| google/siglip2-so400m-patch14-384 | safetensors (PyTorch) | GPU/CPU | no cuantizado en origen | Apache 2.0 | Hugging Face |
| Otras conversiones RKNN de codificadores visuales | RKNN | NPU Rockchip | variable | según modelo base | no disponible |

La comparación directa con alternativas equivalentes en formato RKNN no está disponible en la información proporcionada. Frente al checkpoint original de Google, la diferencia principal es el formato y el hardware objetivo: el modelo de Google requiere framework de deep learning y GPU o CPU, mientras que este artefacto está compilado para NPU Rockchip con cuantización de pesos.

## Limitaciones y advertencias

- Solo incluye el codificador visual: el codificador de texto del SigLIP 2 original no está presente, por lo que no sirve para tareas imagen-texto sin un componente adicional.
- Resolución fija de 384x384: no admite otras resoluciones de entrada en esta conversión.
- Cuantización con pérdida: los perfiles w4a16 y w6a16 degradan la precisión numérica respecto a los pesos originales; conviene validar la calidad de los embeddings en el caso de uso concreto.
- Hardware restringido: únicamente chips RK1820 y RK1828 con el runtime RKNN v1.1.0 y driver compatible; no funciona en GPU ni en CPU convencional.
- Artefacto derivado: los pesos son una conversión, no los originales de Google, y siguen sujetos a la licencia Apache 2.0 del modelo base y a las restricciones de uso del mismo.
- Licencias adicionales: el RKNN Toolkit y el RKNN Runtime tienen sus propias licencias; las librerías de runtime no se incluyen en el paquete.
- Sin datos de sesgo ni de alucinación: al no generar texto, no aplican en el sentido habitual, pero los sesgos del dataset de entrenamiento original de SigLIP 2 pueden reflejarse en los embeddings.
- Sin métricas publicadas: no hay benchmarks ni datos de latencia o throughput que permitan estimar el rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VIT-siglip2-so400m-patch14-384
- Modelo base: https://huggingface.co/google/siglip2-so400m-patch14-384
- Documentación de configuración w4a16: https://huggingface.co/UGREENDEV/RK182X-VIT-siglip2-so400m-patch14-384/tree/main/siglip2-so400m-patch14-384-384x384-w4a16-8
- Documentación de configuración w6a16: https://huggingface.co/UGREENDEV/RK182X-VIT-siglip2-so400m-patch14-384/tree/main/siglip2-so400m-patch14-384-384x384-w6a16-8
- ModelScope: https://modelscope.cn/models/UGREENDEV/RK182X-VIT-siglip2-so400m-patch14-384
