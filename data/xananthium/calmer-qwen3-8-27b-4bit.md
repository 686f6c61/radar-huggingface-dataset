# Xananthium/Calmer-Qwen3.8-27B-4bit

## Resumen

Calmer-Qwen3.8-27B-4bit es una edición experimental de pesos (weight-space programming) publicada por Xananthium sobre el GGUF cuantizado HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, un modelo de 27.320.697.856 parámetros (unos 27,3 B) de la familia Qwen 3.8. No es un reentrenamiento ni un fine-tuning: el autor aplica una actualización lineal fija de rango uno sobre tres matrices down-projection del MLP (capas 49, 50 y 51, índices base cero) y publica el modelo fusionado junto con el delta exacto, la configuración congelada y un paquete de runtime portable.

El objetivo declarado es modificar el comportamiento de generación en razonamiento de nivel medio (medium reasoning) y temperatura 1,3, reduciendo continuaciones repetitivas y ajustando la tasa de acierto en paneles pequeños de HLE y GSM8K. El propio autor insiste en que las mejoras no están demostradas de forma general: los paneles son de 24 a 32 preguntas, las continuaciones repetitivas se reutilizaron durante el descubrimiento de la edición y el modelo editado introduce errores nuevos en GSM8K y en seguimiento de estado.

La relevancia es metodológica más que de rendimiento: el release separa explícitamente la representación medida (GGUF empaquetado original más una corrección FP32 en sidecar) de la representación publicada (matrices materializadas en F32 dentro del GGUF fusionado), y advierte de que un motor GGUF puede usar kernels y redondeos distintos, por lo que las puntuaciones históricas no deben atribuirse al fichero fusionado. Es un artefacto de investigación reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder auto-regresivo; el GGUF declara la arquitectura `qwen35`. Edición de pesos sobre las down-projections del MLP de las capas 49, 50 y 51 |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | No aplica: no se documenta variante MoE ni parámetros activos |
| Longitud de contexto | No disponible en la model card; la configuración congelada está en `hf-config/` |
| Tipos de cuantizacion | Mezcla de la familia Q4_K_P (no es 4 bits uniforme); las tres down-projections editadas se promueven a F32; proyector de visión en BF16; delta exacto en `calmer_delta.npz` |
| Idiomas soportados | Inglés (`en`) declarado en la model card y en los metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Calmer-Qwen3.8-27B-Q4_K_P-F32Edits.gguf`, 18.809.113.472 bytes), `mmproj-Qwen3.8-27B-BF16.gguf`, `calmer_delta.npz`, runtime en código fuente, `hf-config/` |
| Tamano del repositorio | 19,8 GB |
| Estado | Experimental; el metadato de la model card marca `inference: false` |
| Version de llama.cpp validada | Commit `b21e4de74567f5eef213765c9476a843c2e43f0d` (carga y decodificación en CPU) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder de la familia Qwen 3.8 con 27,3 B de parámetros, publicado originalmente como GGUF de precisión mixta de la familia Q4_K_P. Sobre esa base, el autor no entrena: aplica una intervención de espacio de pesos con la forma `W_new = W - alpha * outer(u, coeff)`, con `alpha` global de 1,5, fuerzas efectivas por capa de 0,25 (capa 49), 1,5 (capa 50) y 0,25 (capa 51), y 64 columnas de entrada seleccionadas por capa. Los arrays de coeficientes guardados ya codifican el escalado relativo de los flancos.

La dirección `u` y el soporte disperso se estimaron a partir de continuaciones GSM construidas como productivas o repetitivas y de pesos decodificados. No se usó optimizador de gradiente, pero el autor califica la intervención como ajustada a datos (data-fitted): es un mapa lineal fijo que no inspecciona el prompt ni selecciona respuestas de una tabla. En el fichero fusionado, las tres matrices afectadas se materializan en F32 para evitar una recuantización adicional de la edición; el resto de tensores del GGUF original permanece byte a byte idéntico. El paquete incluye también el proyector de visión BF16 sin modificar, separado de la edición del modelo de texto.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo de pensamiento (thinking) y respuesta final separadas, tal como se contabilizan en el estudio del autor.
- Razonamiento de nivel medio (`medium reasoning`) como configuración de referencia del estudio, con muestreo a temperatura 1,3, top-p 0,95, top-k 20 y penalización de repetición 1.
- Resolución de problemas de matemáticas de primaria/secundaria (GSM8K) y preguntas de dificultad alta tipo HLE en los paneles evaluados.
- Capacidad de seguimiento de estado y de transferencia de estado en tareas multi-paso (panel de transferencia de estado revisado por agente).
- Emisión de llamadas a herramientas (tool calling) en formato de acciones; el autor evalúa cuatro correcciones prescritas de siguiente acción con herramienta.
- Soporte multimodal de entrada de imágenes a través del proyector `mmproj-Qwen3.8-27B-BF16.gguf`, que se distribuye sin modificar y es opcional.
- Multilingüe: no acreditado; la model card declara únicamente inglés.
- Reproducibilidad: el delta exacto, la configuración, el tokenizer, la plantilla de chat y los manifiestos de procedencia se publican junto al modelo.

## Casos de uso

- Investigación en edición de pesos: replicar la intervención de rango uno sobre las capas 49 a 51 usando `calmer_delta.npz` y comparar el comportamiento frente al modelo base con las mismas peticiones congeladas, lo que permite estudiar cómo una actualización lineal fija altera la distribución de salida sin reentrenar.
- Auditoría de representación numérica en GGUF: usar el par formado por el fichero fusionado en F32 y el paquete de runtime para medir cuánto diverge el resultado de un motor GGUF respecto a la corrección FP32 en sidecar, un caso práctico de validación de kernels y redondeos.
- Estudio de degeneración y repetición en bucles de agente: el modelo está pensado para reducir continuaciones repetitivas; sirve como banco de pruebas controlado para medir tokens generados y finalización correcta en continuaciones construidas (en el panel del autor, 1.228 tokens frente a 4.906 del original).
- Evaluación de razonamiento con presupuesto de tokens: alargar o acortar el modo de pensamiento y medir el equilibrio entre tokens totales y acierto, dado que la edición consume un 12,8 % más de tokens en el panel HLE de 32 preguntas.
- Pruebas de tool calling en local: ejecutar el modelo en llama.cpp con la plantilla de chat incluida en `hf-config/` para validar la generación de llamadas a funciones en un entorno sin GPU dedicada, asumiendo que las llamadas generadas no fueron ejecutadas en el estudio original.
- Docencia y divulgación técnica: ilustrar qué es y qué no es una edición de pesos, comparando el modelo base sin editar con el fusionado bajo idénticas condiciones de muestreo.
- Prototipado de pipelines de razonamiento multimodal en CPU/GPU híbrida, cargando el proyector BF16 para entrada de imágenes, siempre con validación numérica propia del runtime.

## Benchmarks y rendimiento

Los datos disponibles son paneles locales pequeños, no puntuaciones de benchmark completas. Todas las comparaciones usan peticiones congeladas idénticas, razonamiento medio, temperatura 1,3, top-p 0,95, top-k 20 y penalización de repetición 1.

| Panel | Original | Edicion seleccionada |
|---|---:|---:|
| HLE: subconjunto fijo de 32 preguntas de texto, acierto estricto | 3/32 | 4/32 |
| GSM8K: 24 casos de retención previamente expuestos | 24/24 | 23/24 |
| Transferencia de estado redactada, correcto según agente revisor | 4/4 | 3/4 |
| Continuaciones repetitivas construidas, completadas correctamente | 1/2 | 2/2 |
| Tokens generados en esas dos continuaciones | 4.906 | 1.228 |
| Cuatro correcciones prescritas de siguiente acción con herramienta | 4/4 | 4/4 |

El cambio en HLE se compone de tres aciertos ganados y dos perdidos; una de las opciones ganadas contiene un defecto aritmético en la explicación y ninguna de las diez omisiones del baseline preespecificadas se reparó. En total se compararon 37 preguntas HLE distintas en el serving real (32 del panel más 4 de desarrollo a dos semillas y una pregunta adicional de grafos planos), no el examen HLE completo. No se han publicado resultados de MMLU, HumanEval ni de benchmarks estándar completos en la información disponible.

## Requisitos de hardware

- Peso del fichero GGUF fusionado: 18.809.113.472 bytes (unos 17,5 GiB), más el proyector de visión BF16 si se usa entrada de imagen.
- VRAM estimada para descarga completa en GPU: aproximadamente 18-19 GB solo para los pesos de texto, más overhead de contexto y caché KV; con 24 GB (RTX 3090, RTX 4090, L4 24 GB, A10G 24 GB) se puede plantear offload total del modelo de texto con contexto moderado.
- GPU de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB): offload parcial con capas en CPU; el rendimiento cae de forma proporcional al número de capas desplazadas.
- Servicio en producción: A100 40/80 GB o H100 para lotes concurrentes con contexto largo y para separar el modelo de texto del proyector de visión.
- Despliegue: llama.cpp (validado en el commit `b21e4de74567f5eef213765c9476a843c2e43f0d`, carga y decodificación en CPU correctas) con un motor que soporte la arquitectura `qwen35` y tipos de tensor mixtos; el repositorio incluye un runtime propio en `runtime/` cuyas fuentes CUDA deben compilarse y revalidarse numéricamente.
- Ollama y otros frontends basados en llama.cpp solo son viables si su versión soporta `qwen35` y la mezcla Q4_K_P con tensores F32; vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput: no disponibles. El autor no publica medidas de velocidad; solo consta el recuento de tokens generados en los paneles (1.228 frente a 4.906 en las continuaciones repetitivas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Calmer-Qwen3.8-27B-4bit | 27,3 B | No disponible | Apache 2.0 | GGUF mixto Q4_K_P + F32, npz, runtime | Edición de pesos experimental; paneles de 24-32 preguntas |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (base) | 27,3 B | No disponible | No disponible en la información | GGUF | Modelo de partida sin editar; mismas peticiones congeladas como referencia |
| Otras variantes Qwen 3.8 de ~27-32 B | ~27-32 B | No disponible | No disponible | safetensors, GGUF | No se dispone de datos de rendimiento comparables en la información proporcionada |

La comparación relevante es contra el propio modelo base: mismo tamaño, misma licencia declarada y misma tokenización, con la única diferencia de las tres matrices editadas. No hay datos públicos en esta ficha para comparar con Alternativas de otros autores en MMLU, HumanEval o GSM8K completo.

## Limitaciones y advertencias

- Experimental y no validado: la model card marca `inference: false`; el autor afirma explícitamente que la mejora general no está demostrada.
- Paneles minúsculos: 32 preguntas HLE, 24 casos GSM8K y 4 casos de transferencia de estado; los intervalos de confianza son enormes y el cambio en HLE son tres aciertos frente a dos pérdidas.
- Errores introducidos: la edición provoca un fallo real en GSM8K y otro en seguimiento de estado, y una de las respuestas HLE ganadas contiene aritmética incorrecta en la justificación.
- Mayor coste en tokens: un 12,8 % más de tokens totales en el panel HLE de 32 preguntas pese a la reducción en continuaciones repetitivas.
- Sesgo de selección adaptativa: las continuaciones repetitivas se reutilizaron durante el descubrimiento de la edición, de modo que no son evidencia independiente de reparación de bucles de agente en el mundo real.
- Tool calling no verificado end-to-end: las llamadas generadas no se ejecutaron; solo se evaluó la corrección de la siguiente acción prescrita.
- Dependencia de representación: las puntuaciones históricas corresponden a la representación con sidecar FP32, no al fichero fusionado; cualquier motor GGUF puede aplicar kernels y redondeos distintos y romper la equivalencia numérica.
- Idioma: solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto desconocido: la longitud de contexto no se publica; debe leerse de `hf-config/` antes de dimensionar despliegues.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base se distribuye como "Uncensored" y sin filtros de seguridad documentados; la responsabilidad de moderación recae en el integrador.
- Procedencia: el runtime incluido requiere compilación de fuentes CUDA y una validación numérica nueva; no se garantiza paridad con la versión usada en el estudio.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación para esta edición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xananthium/Calmer-Qwen3.8-27B-4bit
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio de investigación del autor: https://github.com/Xananthium/Qwen3.8-Weight-Space-Programming
- llama.cpp (commit validado `b21e4de74567f5eef213765c9476a843c2e43f0d`): https://github.com/ggml-org/llama.cpp
- Descarga directa: `hf download Xananthium/Calmer-Qwen3.8-27B-4bit --local-dir Calmer-Qwen3.8-27B-4bit`
