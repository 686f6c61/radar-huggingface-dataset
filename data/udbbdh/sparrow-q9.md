# udbbdh/sparrow-q9

## Resumen

Sparrow-q9 es un repositorio de pesos publicado en Hugging Face por el usuario `udbbdh` que contiene dos checkpoints independientes en formato safetensors, cada uno con su propia configuración de arquitectura embebida como JSON en la clave `config` de los metadatos del fichero. No se trata de un único modelo con dos variantes, sino de dos modelos condicionados por modalidades distintas: `q9_a.safetensors` (303,5 M de parámetros) recibe como condición una nube de puntos de 8.192 puntos con normales, y `q9_b.safetensors` (544,9 M de parámetros) recibe una imagen.

El checkpoint `q9_b` incorpora los pesos congelados y sin modificar del backbone de imagen DINOv2 ViT-L/14 bajo las claves `cond_encoder.backbone.*`, redistribuidos según el autor bajo licencia Apache 2.0. Esto sugiere un diseño de modelo generativo condicionado (probablemente difusión o flow matching, aunque la model card no lo especifica) que reutiliza un codificador visual preentrenado como extractor de características.

La relevancia del repositorio es limitada por la escasez de documentación: no se declara licencia para el conjunto, no se indican idiomas, pipeline ni datos de entrenamiento, y el repositorio acumula cero descargas y cero likes en el momento de la consulta. Su interés técnico reside en el enfoque multimodal de condición (nube de puntos e imagen) y en el tamaño contenido de los checkpoints (3,4 GB en total), que los hace manejables en hardware de gama alta de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que cada checkpoint embebe su configuración como JSON en los metadatos safetensors; `q9_b` incluye un backbone DINOv2 ViT-L/14 congelado) |
| Parámetros totales | 303,5 M (`q9_a.safetensors`) y 544,9 M (`q9_b.safetensors`) |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos publicados son fp32; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio; los pesos de DINOv2 ViT-L/14 en `q9_b` se redistribuyen bajo Apache 2.0 según el autor |
| Formato de pesos | safetensors (fp32) con configuración JSON embebida en la clave `config` de los metadatos |

## Arquitectura y entrenamiento

La información disponible no permite determinar la arquitectura completa de ninguno de los dos checkpoints. La model card únicamente documenta el mecanismo de configuración (JSON embebido en los metadatos del safetensors) y, para `q9_b`, la presencia de un codificador de condición basado en DINOv2 ViT-L/14 con pesos congelados bajo el prefijo `cond_encoder.backbone.*`. El tamaño de 544,9 M de parámetros de `q9_b` es coherente con un ViT-L/14 (aproximadamente 300 M de parámetros en el backbone) más un decodificador o cabeza generativa de tamaño moderado; el de 303,5 M de `q9_a` sugiere una red condicionada por nube de puntos de escala similar.

No se han publicado datos sobre el corpus de entrenamiento, el número de tokens o muestras, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. Cualquier afirmación sobre estos puntos sería especulativa y, por tanto, se omite.

## Capacidades

- Generación condicionada por nube de puntos: `q9_a` acepta como entrada una nube de 8.192 puntos con normales, lo que lo sitúa en el ámbito de la generación 3D condicionada (forma, vista o representación derivada, sin que la model card concrete la salida).
- Generación condicionada por imagen: `q9_b` acepta una imagen como condición, apoyándose en las características extraídas por el backbone DINOv2 ViT-L/14 congelado.
- Extracción de características visuales: el backbone DINOv2 incluido en `q9_b` puede reutilizarse por separado como codificador de imagen, aunque no se documenta una interfaz para ello.
- Capacidades de texto, razonamiento, código o matemáticas: no disponibles; no hay evidencia de que el modelo procese lenguaje natural.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): solo visión como condición de entrada en `q9_b`; no se documenta audio ni modos de razonamiento explícito.

## Casos de uso

- Generación 3D condicionada por nube de puntos: usar `q9_a` con escaneos de 8.192 puntos con normales procedentes de sensores LiDAR o fotogrametría para producir representaciones derivadas (mallas, vistas o campos implícitos, según la salida real del modelo, que la model card no detalla).
- Reconstrucción asistida en pipelines de captura: integrar `q9_a` como etapa intermedia tras el registro de nubes de puntos para completar o refinar geometría en flujos de digitalización de objetos.
- Generación de imagen a partir de imagen: emplear `q9_b` como modelo de traducción imagen-a-imagen (por ejemplo, boceto a render o imagen a variación) aprovechando el codificador DINOv2 congelado.
- Prototipado de investigación en modelos condicionados: los checkpoints son lo bastante pequeños (303,5 M y 544,9 M) para experimentar con fine-tuning o ablaciones en una sola GPU, lo que facilita estudios comparativos entre condiciones 3D y 2D.
- Reutilización del codificador visual: extraer el backbone DINOv2 ViT-L/14 de `q9_b` para tareas de clasificación, recuperación o segmentación por características, dado que los pesos se redistribuyen bajo Apache 2.0.
- Evaluación de robustez multimodal: comparar el comportamiento de dos cabezas generativas con el mismo esquema de configuración embebida frente a entradas ruidosas (nubes de puntos dispersas frente a imágenes con oclusión) en entornos de benchmark internos.
- Docencia y demostraciones: por su tamaño contenido y su formato safetensors estándar, ambos checkpoints sirven para ilustrar arquitecturas condicionadas en cursos o talleres sin requerir clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB para `q9_a` (303,5 M de parámetros) y 2,2 GB para `q9_b` (544,9 M), sin contar activaciones ni buffers del codificador de condición.
- VRAM estimada con cuantización a fp16/bf16: alrededor de 0,6 GB y 1,1 GB respectivamente; con int8, aproximadamente 0,3 GB y 0,55 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; una RTX 3060, RTX 4060 o superior es suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, en toda la gama actual (RTX 20xx en adelante, e incluso iGPU con memoria unificada suficiente), dado el reducido tamaño de los checkpoints.
- Opciones de despliegue: al ser safetensors con configuración embebida y sin código de modelado publicado, no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; será necesario cargar los pesos con `safetensors` y reconstruir la arquitectura a partir del JSON de configuración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica la tarea exacta ni modelos comparables de la misma categoría (generación condicionada por nube de puntos o por imagen con backbone DINOv2). A modo de referencia estructural, el backbone DINOv2 ViT-L/14 incluido en `q9_b` es el mismo que emplean numerosos modelos de difusión condicionada por imagen, pero sin datos de rendimiento no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe la tarea de salida, el proceso de entrenamiento ni las métricas, lo que impide evaluar la calidad del modelo antes de usarlo.
- Licencia no declarada para el repositorio: solo se especifica Apache 2.0 para los pesos de DINOv2 ViT-L/14 en `q9_b`; el uso comercial de los pesos propios de `q9_a` y `q9_b` queda sin marco legal explícito.
- Riesgo de alucinación y artefactos: sin benchmarks ni ejemplos de salida publicados, no puede descartarse la generación de geometría o imágenes plausibles pero incorrectas.
- Idiomas: no aplica ni está documentado; no hay evidencia de capacidades de lenguaje natural.
- Contexto: no disponible; no se especifica ninguna ventana de contexto ni resolución de entrada para la imagen o la nube de puntos.
- Repositorio sin tracción: cero descargas y cero likes, sin issues ni discusión pública, lo que reduce la probabilidad de soporte comunitario o corrección de errores.
- Formato empaquetado: al no incluir código de modelado, la integración en producción exige trabajo adicional de ingeniería para interpretar la configuración y reconstruir la arquitectura.
- Fecha de creación futura (2026-11-07) en los metadatos de Hugging Face, lo que puede indicar un artefacto de prueba o un repositorio no validado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/udbbdh/sparrow-q9
- Licencia Apache 2.0 (referenciada para los pesos de DINOv2 ViT-L/14): https://www.apache.org/licenses/LICENSE-2.0
- Resultado de búsqueda no relacionado (mod de ArmA 2 con nombre similar, sin vinculación con este modelo): https://www.moddb.com/mods/sparrow-ai-modpack-for-arma-2
