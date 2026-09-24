# YuhengSSS/SDRPN-Qwen3.5-4B

## Resumen

SDRPN-Qwen3.5-4B es un checkpoint de la etapa 1 (stage-1) del método SD-RPN (*Self-Distilled Region Proposal Network*), desarrollado por YuhengSSS (Shi, Pei, Dong y Xu). No es un modelo de lenguaje autónomo, sino un *twig* predictor de regiones de interés (RoI) acoplado a un backbone congelado `Qwen/Qwen3.5-4B`. Su función es localizar automáticamente las zonas de una imagen que merecen ser procesadas en alta resolución, de forma que un modelo multimodal pueda percibir detalles finos sin degradar la imagen completa. Resuelve el problema clásico del *trade-off* entre resolución y coste computacional en MLLM: en lugar de procesar toda la imagen a alta resolución, se seleccionan regiones candidatas y se injertan como sub-imágenes.

Técnicamente, el backbone `Qwen3.5-4B` permanece congelado y solo se entrenan tres bloques *twig* adicionales (K = 21, T = 3), a partir de pseudo-etiquetas de atención autodestiladas, sin anotación humana de RoI. El checkpoint contiene los pesos completos (backbone + twig) en safetensors bfloat16, con 5.497.418.752 parámetros reales según el recuento de safetensors (aproximadamente 5,5 mil millones, pese al sufijo "4B" del nombre).

Es relevante porque es la inicialización oficial de la ejecución de RL a nivel de región Vision-RL² y porque publica una mejora sustancial sobre el modelo base en el protocolo de evaluación alineado con el entrenamiento: la media de seis benchmarks sube de 56,2 (base) a 66,6 (etapa 1), con un salto especialmente marcado en V* (66,0 → 82,7). Además, el checkpoint es inutilizable con `AutoModel` estándar: requiere el código de modelado del repositorio VisionRL2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-4B congelado) más twig SD-RPN de predicción de RoI; el detalle interno de capas no está disponible |
| Parámetros totales | 5.497.418.752 (recuento de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos publicados están en bfloat16. No se listan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); requiere código de modelado propio para inferencia de RoI |

Datos adicionales del repositorio: 5 descargas, 0 *likes*, tamaño del repositorio 11,0 GB, creado y actualizado el 24 de septiembre de 2026. Pipeline declarado: `image-text-to-text`. Modelo base: `Qwen/Qwen3.5-4B` (finetune).

## Arquitectura y entrenamiento

La arquitectura parte del backbone multimodal `Qwen/Qwen3.5-4B`, que se mantiene **congelado** durante todo el entrenamiento de esta etapa. Sobre él se acoplan tres bloques *twig* con hiperparámetros K = 21 y T = 3 (la model card no detalla el significado exacto de estos valores ni si corresponden a número de propuestas, número de bloques o profundidad). El mecanismo de inferencia de RoI descrito por los autores incluye cuatro componentes que viven en las clases del repositorio y no en los pesos por sí solos: una cabeza de mapa de calor (*heatmap head*), una puerta relativa al pico (*peak-relative gate*), un recorte por componentes conectados (*connected-component crop*) y un injerto de sub-imagen (*sub-image splice*).

El entrenamiento de la etapa 1 es de autodestilación: el twig aprende a predecir regiones a partir de pseudo-etiquetas derivadas de la atención del propio modelo, sin anotación humana de RoI. Esto es relevante porque elimina la necesidad de datasets de *bounding boxes* y permite escalar el entrenamiento a corpus de imágenes sin etiquetar. La etapa 2, no incluida en este checkpoint, aplica optimización de política (RL) a nivel de región y produce el checkpoint `YuhengSSS/VisionRL2-Qwen3.5-4B`. El entrenamiento RL parte explícitamente de estos pesos mediante el script `scripts/train_rl_qwen3_5_4b.sh` del repositorio.

## Capacidades

- Predicción de regiones de interés (RoI) sobre imágenes, orientada a percepción multimodal de grano fino.
- Generación de texto e imagen-texto a texto heredada del backbone Qwen3.5-4B (condicionada a que el modelo se cargue con el código correcto).
- Selección jerárquica de regiones mediante cabeza de mapa de calor y puerta relativa al pico, con recorte por componentes conectados.
- Inserción de sub-imágenes en el contexto del backbone (*sub-image splice*) para su procesamiento a mayor resolución efectiva.
- Capacidad de operar como inicialización reproducible de una ejecución de RL posterior (Vision-RL²).
- Rendimiento destacado en tareas de percepción de detalle: V*, ZoomBench, HR-4K, HR-8K, MME-RW Lite e InfoVQA.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking*, audio o vídeo: no disponibles en la información proporcionada.

## Casos de uso

- **Percepción de grano fino en documentos densos**: el twig propone regiones (tablas, sellos, notas al pie) y estas se injertan como sub-imágenes, de modo que el backbone las procesa con resolución efectiva alta. El salto en InfoVQA (69,8 → 78,1) respalda este escenario.
- **Análisis de imágenes de alta resolución (HR-4K y HR-8K)**: el modelo evita procesar el fotograma completo a máxima resolución y concentra el cómputo en las zonas propuestas; pasa de 63,5 a 71,1 en HR-4K y de 56,4 a 63,3 en HR-8K frente al base.
- **Inspección visual industrial**: detección de defectos localizados (grietas, soldaduras, etiquetas mal colocadas) donde el defecto ocupa una fracción pequeña de la imagen y se pierde al reescalar.
- **Búsqueda visual con *zoom* iterativo**: el comportamiento medido en ZoomBench (40,5 base → 55,6 etapa 1) lo hace adecuado para pipelines que necesitan ampliar progresivamente una región hasta responder una pregunta concreta.
- **Análisis de imágenes médicas o de microscopía**: regiones de interés pequeñas dentro de un campo amplio; el recorte por componentes conectados permite aislar estructuras candidatas antes de la descripción textual.
- **Preprocesado de datos para otros MLLM**: el checkpoint puede usarse como generador de propuestas de región para anotar automáticamente corpus de imagen-texto, dado que no requiere anotación humana de RoI.
- **Punto de partida para investigación en RL multimodal**: cualquiera que quiera reproducir Vision-RL² puede arrancar de aquí con `PHASE_A_CKPT` apuntando a este directorio local.
- **Evaluación académica de métodos de atención visual**: sirve como referencia de etapa 1 frente a la etapa 2 en el mismo protocolo alineado de seis benchmarks.

## Benchmarks y rendimiento

Protocolo alineado con el entrenamiento (métricas de reglas, sin juez), con límite de fuente de 576 tokens. Datos publicados en la model card:

| Modelo | V* | ZoomBench | HR-4K | HR-8K | MME-RW Lite | InfoVQA | Media |
|---|---|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 66,0 | 40,5 | 63,5 | 56,4 | 41,0 | 69,8 | 56,2 |
| SD-RPN (etapa 1), este checkpoint | 82,7 | 55,6 | 71,1 | 63,3 | 48,9 | 78,1 | 66,6 |
| Vision-RL² (etapa 2) | 85,3 | 61,8 | 77,4 | 70,9 | 51,0 | 80,5 | 71,1 |

Desglose de la mejora de la etapa 1 sobre el backbone: +16,7 puntos en V*, +15,1 en ZoomBench, +7,6 en HR-4K, +6,9 en HR-8K, +7,9 en MME-RW Lite, +8,3 en InfoVQA y +10,4 de media. Se trata de las cifras declaradas por el autor y no han sido verificadas de forma independiente en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia**: al menos 11,0 GB solo para pesos en bfloat16 (tamaño del repositorio), más activaciones y el coste del pipeline de RoI. Estimación orientativa: ~12-14 GB en bf16/fp16 para inferencia, ~6-7 GB en cuantización de 8 bits y ~4 GB en 4 bits (estas dos últimas no están publicadas por el autor y serían conversiones propias).
- **GPU recomendadas**: A100 40 GB o 80 GB, H100, L40S y, en general, cualquier GPU con 16 GB o más de VRAM para bf16.
- **GPU de consumo**: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bfloat16, con margen para activaciones y recortes. En tarjetas de 12-16 GB requeriría cuantización. El recorte de regiones y el injerto de sub-imágenes añaden picos de memoria por el procesamiento de sub-imágenes a alta resolución.
- **Opciones de despliegue**: en la información disponible, únicamente el *harness* del repositorio `YuHengsss/VisionRL2` (clases de modelo propias y `scripts/aligned_eval.sh`). **No** es cargable mediante `AutoModel` / `AutoModelForCausalLM` para inferencia de RoI. No se documentan soportes de vLLM, TGI, llama.cpp, Ollama ni formato GGUF.
- **Latencia y throughput**: no disponibles. Cabe esperar un coste adicional respecto al backbone puro por la generación de propuestas y el procesado de hasta K = 21 regiones por imagen, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDRPN-Qwen3.5-4B (este) | 5.497.418.752 | No disponible | Twig de propuesta de RoI autodestilado sobre Qwen3.5-4B congelado | Apache 2.0 | Pesos en HF; requiere código VisionRL2 |
| Vision-RL² (etapa 2) | No disponible | No disponible | Mismo backbone y twig, tras RL a nivel de región | Apache 2.0 (según colección) | Pesos en HF; requiere código VisionRL2 |
| Qwen/Qwen3.5-4B (base) | No disponible | No disponible | MLLM de propósito general | No disponible en la información aportada | Pesos en HF, cargable con `AutoModel` |

No se dispone de información sobre otros modelos comparables de propuesta de región o de percepción multimodal de grano fino en los datos proporcionados, por lo que la comparativa se limita a los tres elementos de la misma familia. La principal diferencia funcional es que este checkpoint no es un modelo de propósito general: está especializado en seleccionar regiones y depende de código externo para funcionar.

## Limitaciones y advertencias

- **No es cargable de forma estándar**: la model card indica explícitamente que los pesos no funcionan para inferencia de RoI con `AutoModel` / `AutoModelForCausalLM`; la ruta de *gating* (mapa de calor, puerta relativa al pico, recorte por componentes conectados y *splice*) vive en las clases del repositorio VisionRL2. Cualquier integración en producción depende de mantener ese fork de código.
- **Adopción mínima**: 5 descargas y 0 *likes* en el momento de la consulta, lo que implica ausencia de validación comunitaria y de *issues* resueltos por terceros.
- **Checkpoint intermedio**: es la etapa 1 de un pipeline de dos etapas; la etapa 2 (Vision-RL²) obtiene mejores cifras en todos los benchmarks reportados. Usar la etapa 1 en producción solo tiene sentido si se busca reproducibilidad del punto de partida del RL.
- **Benchmarks autodeclarados**: las cifras proceden del propio autor, con protocolo alineado al entrenamiento (métricas de reglas, sin juez) y límite de fuente de 576 tokens. No hay verificación independiente disponible.
- **Sesgos**: no se documenta ningún análisis de sesgo, de sesgo de género, racial ni cultural. Al heredar el backbone Qwen3.5-4B y entrenar solo el twig, los sesgos del backbone se mantienen íntegros.
- **Alucinación**: no se publican tasas de alucinación ni evaluaciones de fidelidad. El twig añade una fuente adicional de error: una propuesta de región incorrecta puede llevar al backbone a describir una zona irrelevante.
- **Idiomas**: no se declara ningún conjunto de idiomas soportados; la ficha de HuggingFace no incluye el campo de idiomas.
- **Contexto**: la longitud de contexto no está disponible, lo que impide planificar cargas con secuencias largas o muchas sub-imágenes simultáneas.
- **Licencia**: Apache 2.0 permite uso comercial, pero la obligación práctica de distribuir y mantener el código de modelado del repositorio VisionRL2 (cuya licencia no se detalla en la información aportada) es un riesgo legal que conviene verificar antes de un despliegue comercial.
- **Cuantización**: no se publican pesos cuantizados; cualquier GGUF, AWQ o GPTQ sería una conversión de terceros y podría romper la ruta de *gating* del twig, que no es un transformer estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YuhengSSS/SDRPN-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint de etapa 2 (Vision-RL²): https://huggingface.co/YuhengSSS/VisionRL2-Qwen3.5-4B
- Código: https://github.com/YuHengsss/VisionRL2
- Dataset (corpus SD-RPN, pools de RL, mapas de evidencia): https://huggingface.co/datasets/YuhengSSS/VisionRL2-data
- Colección: https://huggingface.co/collections/YuhengSSS/visionrl2
- Página del proyecto: https://yuhengsss.github.io/VisionRL2/
- Paper Vision-RL²: https://arxiv.org/abs/2609.19745
- Paper SD-RPN: https://arxiv.org/abs/2509.16944

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
