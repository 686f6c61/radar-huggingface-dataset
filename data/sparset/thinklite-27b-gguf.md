# Sparset/Thinklite-27B-GGUF

## Resumen

Thinklite-27B-GGUF es la versión cuantizada en formato GGUF del modelo Thinklite-27B, desarrollado por Sparset. Se trata de un modelo de lenguaje de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors) especializado en razonamiento eficiente: su propuesta central es reducir de forma drástica el número de tokens de razonamiento generados frente a su modelo base, Qwen3.8-27B, manteniendo casi intacta la precisión en tareas de matemáticas, conocimiento e instrucciones.

El repositorio contiene pesos cuantizados con llama.cpp empleando una matriz de importancia (imatrix), con un archivo Q4_K_M de 16,5 GB como artefacto principal. Según la model card, en modo `reasoning_effort="xhigh"` esta cuantización emplea un 55,5 % menos de tokens de razonamiento que Qwen3.8-27B cuantizado con la misma receta, conservando el 98,3 % de su precisión media (92,0 frente a 93,6) y entregando la respuesta completa unas 2,18 veces antes para un único usuario.

Su relevancia actual reside en el coste de inferencia: en modelos con modo de pensamiento, la mayor parte de los tokens generados se dedican al razonamiento interno, lo que encarece y ralentiza cada respuesta. Thinklite ataca directamente ese cuello de botella, y lo hace con licencia Apache 2.0 y un formato (GGUF) que permite ejecución local en llama.cpp sin infraestructura dedicada. El modelo base completo está disponible en precisión BF16 en el repositorio Sparset/Thinklite-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix; el repositorio distribuye Q4_K_M (16,5 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en BF16/safetensors |

## Arquitectura y entrenamiento

Thinklite-27B es un transformer denso construido sobre Qwen3.8-27B, del que hereda la arquitectura y los pesos como punto de partida (la relación declarada en el repositorio es `quantized` respecto a Sparset/Thinklite-27B). La innovación no está en la arquitectura sino en el comportamiento de razonamiento: el modelo ha sido ajustado para producir cadenas de pensamiento sustancialmente más cortas sin degradar la exactitud final. La model card reporta que el modelo completo en BF16 recorta un 47 % de los tokens de razonamiento conservando el 99,6 % de la precisión de Qwen3.8-27B, y que la cuantización Q4_K_M con imatrix preserva ese comportamiento (55,5 % de reducción y 98,3 % de precisión retenida en la suite de cuatro benchmarks).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineación. La model card tampoco detalla innovaciones de decodificación especulativa ni mecanismos de atención alternativos. La cuantización se realizó con llama.cpp aplicando una importance matrix, una técnica que pondera la relevancia de cada peso durante la cuantización para minimizar la pérdida de calidad respecto a una cuantización uniforme.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, con etiqueta `conversational` en el repositorio.
- Razonamiento explícito con modo de pensamiento configurable mediante `reasoning_effort`, con al menos los niveles `xhigh` y `low` documentados.
- Razonamiento eficiente: genera menos tokens de pensamiento que el modelo base para un nivel de esfuerzo dado, lo que reduce latencia y coste.
- Matemáticas: evaluado en GSM8K (200 preguntas) y AIME 2025 (30 preguntas).
- Conocimiento general y razonamiento experto: evaluado en MMLU-Pro (150 preguntas).
- Seguimiento de instrucciones: evaluado en IFEval (200 preguntas).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y ejecución local vía llama.cpp.
- Soporte de tool calling, agentes y capacidades multimodales: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido en producción: el modelo resuelve problemas tipo GSM8K y AIME con cadenas de pensamiento más cortas, lo que reduce el coste por consulta en servicios de tutoría o verificación de cálculos, manteniendo el 98,3 % de la precisión del base en la suite medida.
- Asistentes de atención al cliente con razonamiento interno: al recortar los tokens de pensamiento, el tiempo hasta la respuesta final se reduce hasta 2,18 veces en modo `xhigh`, lo que mejora la experiencia en conversaciones interactivas donde la latencia importa.
- Despliegue local en estaciones de trabajo: el archivo Q4_K_M de 16,5 GB cabe en GPUs de consumo con 24 GB de VRAM, permitiendo razonamiento de nivel 27B sin depender de la nube.
- Generación de código y revisión técnica: el modelo conserva las capacidades del base Qwen3.8-27B en seguimiento de instrucciones (IFEval) y puede integrarse en pipelines de revisión donde el razonamiento previo a la respuesta mejora la calidad del parche propuesto.
- Evaluación y benchmarking de eficiencia: útil como referencia para estudiar el compromiso entre longitud de cadena de pensamiento y precisión, gracias a la comparación documentada contra Qwen3.8-27B en cuatro benchmarks.
- Procesamiento por lotes con presupuesto de tokens ajustado: en tareas de clasificación o extracción con razonamiento, el modo `low` reduce un 29,1 % los tokens de pensamiento conservando el 96,5 % de la precisión, lo que abarata el procesamiento masivo.
- Prototipado de agentes con llama.cpp: al ser GGUF e imatrix, se integra en entornos locales y servidores ligeros sin necesidad de GPUs de centro de datos.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan Thinklite-27B Q4_K_M con Qwen3.8-27B Q4_K_M sobre 580 preguntas (200 GSM8K, 30 AIME 2025, 150 MMLU-Pro, 200 IFEval). No se desglosan los resultados por benchmark en la información disponible, solo los agregados.

| Metrica | Thinklite-27B Q4_K_M | Qwen3.8-27B Q4_K_M (referencia) |
|---|---|---|
| Precision media en `xhigh` | 92,0 | 93,6 |
| Precision retenida en `xhigh` | 98,3 % | 100 % (base) |
| Reduccion de tokens de razonamiento en `xhigh` | 55,5 % menos | — |
| Aceleracion TTFO en `xhigh` | 2,18x | 1x |
| Precision retenida en `low` | 96,5 % | 100 % (base) |
| Reduccion de tokens de razonamiento en `low` | 29,1 % menos | — |
| Aceleracion TTFO en `low` | 1,30x | 1x |
| Velocidad de decodificacion (1 usuario) | 69,46 tokens/s | 70,09 tokens/s |

Para el modelo completo en BF16, la model card reporta una reducción del 57,0 % de tokens de razonamiento con el 98,5 % de precisión retenida en `xhigh`, y del 33,1 % con el 96,1 % en `low`, sobre la misma suite de cuatro benchmarks. El dato de cabecera del repositorio BF16 (47 % de reducción y 99,6 % de precisión) proviene de una suite completa de seis benchmarks con 4.291 peticiones y no es directamente comparable con la tabla anterior.

## Requisitos de hardware

- VRAM para el archivo Q4_K_M: aproximadamente 16,5 GB de pesos más overhead de contexto y caché KV; en la práctica requiere alrededor de 18-20 GB de VRAM para contextos moderados.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 3090 o RTX 4090. En GPUs de 16 GB no entra con comodidad en Q4_K_M.
- GPU de centro de datos: A100 (40/80 GB), H100 y L40S ejecutan el modelo sin problemas y permiten contextos amplios y mayor paralelismo.
- Despliegue: llama.cpp es el runtime de referencia del repositorio; también es compatible con Ollama y otros frontends que consumen GGUF. Para el modelo BF16 completo (55,6 GB) se recomienda vLLM, como indica la propia model card para las demostraciones.
- Rendimiento medido: 69,46 tokens/s de decodificación para un único usuario en la GPU de referencia del autor (modelo no especificado), prácticamente idéntico a los 70,09 tokens/s de Qwen3.8-27B Q4_K_M en el mismo hardware.
- Throughput agregado y latencia con lotes concurrentes: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thinklite-27B-GGUF (Q4_K_M) | ~26,9 mil M | No disponible | Apache 2.0 | GGUF | Razonamiento eficiente; 98,3 % de precisión del base con 55,5 % menos tokens de pensamiento |
| Qwen3.8-27B (Q4_K_M) | ~27 mil M (estimado) | No disponible | No disponible en esta ficha | GGUF | Modelo base de referencia; precisión media 93,6 en la suite de 580 preguntas |
| Thinklite-27B (BF16) | ~26,9 mil M | No disponible | Apache 2.0 | Safetensors/BF16 | Versión completa; 55,6 GB; 98,5 % de precisión retenida en la misma suite |

No se dispone de información sobre otros modelos comparables de razonamiento eficiente en el mismo rango de tamaño, por lo que la comparativa se limita al modelo base y a su propia versión sin cuantizar.

## Limitaciones y advertencias

- La evaluación publicada se limita a 580 preguntas de cuatro benchmarks (GSM8K, AIME 2025, MMLU-Pro, IFEval); no cubre código, tareas multilingües ni diálogo abierto, por lo que la generalización del comportamiento eficiente a otros dominios no está verificada.
- El recorte de tokens de razonamiento implica un riesgo mayor de respuestas incorrectas en problemas que requieren cadenas de pensamiento largas; la pérdida de precisión es pequeña en promedio (1,6 puntos en `xhigh`) pero puede concentrarse en tareas específicas no reportadas.
- La cuantización Q4_K_M introduce una degradación adicional respecto al BF16; la model card solo reporta el agregado, sin desglose por benchmark.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni filtros de seguridad aplicados, lo que dificulta evaluar riesgos de alucinación y contenido dañino.
- Idiomas soportados no declarados; no se debe asumir un rendimiento multilingüe equivalente al de Qwen3.8-27B sin pruebas propias.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar las condiciones del modelo original antes de desplegarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria aún inexistente.
- Longitud de contexto no documentada: es un parámetro crítico para planificar el despliegue y debe confirmarse en el repositorio del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Sparset/Thinklite-27B-GGUF
- Modelo base en precisión completa: https://huggingface.co/Sparset/Thinklite-27B
- Vídeo de comparación (debugging, BF16 con vLLM): https://huggingface.co/Sparset/Thinklite-27B/resolve/main/thinklite-side-by-side.mp4
