# Yosepx/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3B es un ajuste fino (fine-tune) del modelo de generación de vídeo texto-a-vídeo Wan-AI/Wan2.1-T2V-1.3B, desarrollado por el usuario Yosepx y publicado en Hugging Face. Su propósito es especializar el modelo base en la generación de contenido para adultos (NSFW), cubriendo un espectro amplio de escenarios, estéticas y acciones descritas en lenguaje natural. El modelo conserva la arquitectura transformer de difusión del original y sus 1.300 millones de parámetros.

El autor documenta dos ciclos de entrenamiento: uno original en dos fases (imágenes y después vídeo) que produjo los checkpoints `e1`–`e20`, y un segundo ciclo experimental (`wan_1.3B_exp_e1` a `e14`) diseñado para corregir los artefactos anatómicos y la degradación de calidad observados en el primero. Según la model card, el checkpoint recomendado para uso general y para entrenamiento de LoRAs es `wan_1.3B_exp_e14.safetensors`.

La relevancia del modelo es acotada pero concreta: ofrece una alternativa de código abierto para investigación y creación de vídeo corto con contenido adulto, un nicho escasamente cubierto por modelos abiertos. El repositorio ocupa 105,4 GB, lo que refleja la inclusión de todos los checkpoints intermedios en formato safetensors. No se han publicado resultados de benchmarks ni métricas objetivas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer texto-a-vídeo (difusión), derivada de Wan2.1-T2V-1.3B |
| Parametros totales | 1.300 millones (1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (los prompts se documentan en inglés) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B, un transformer de difusión para generación de vídeo a partir de texto. El ajuste fino no modifica la arquitectura, sino los pesos: se entrena sobre pares prompt-vídeo e imagen para especializar la distribución de salida hacia contenido NSFW. La model card describe una primera fase (épocas 1–10) entrenada sobre un corpus masivo de imágenes NSFW y una segunda fase (épocas 11–20) entrenada exclusivamente con vídeo para adquirir coherencia temporal. Según el autor, la fase de imágenes fue demasiado agresiva y provocó "olvido catastrófico" de la anatomía coherente, con degradación notable a partir de la época 3.

El ciclo experimental corrige ese problema con un único entrenamiento sobre un dataset mixto de 30.000 clips de vídeo y 20.000 imágenes estáticas, con tasa de aprendizaje más conservadora, batch menor y calendario más corto. El conjunto de datos original se construyó a partir de las 1.000 publicaciones principales de aproximadamente 1.250 subreddits NSFW, con leyendas que siguen las convenciones de etiquetado de esas comunidades. No se documenta el número total de tokens ni si hubo RLHF, DPO u otra etapa de alineación. El repositorio incluye un `prompting-guide.json` con análisis de palabras clave y frases asociadas a los subreddits de origen.

## Capacidades

- Generación de vídeo corto a partir de prompts de texto en el dominio de contenido adulto.
- Coherencia temporal nativa en los checkpoints de la fase de vídeo (épocas 11–20) y en los experimentales, según el autor sin necesidad de LoRAs auxiliares.
- Comprensión de una amplia variedad de escenarios, estéticas, arquetipos de personaje y acciones descritas en lenguaje natural.
- Estilización y detalle derivados de la fase de entrenamiento con imágenes (épocas 1–10 del ciclo original).
- Base para entrenamiento de LoRAs adicionales sobre el checkpoint experimental recomendado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre generación de vídeo NSFW: el modelo permite estudiar cómo un ajuste fino especializado desplaza la distribución del modelo base y qué compromisos aparecen entre fidelidad al dominio y coherencia anatómica.
- Creación de clips cortos para proyectos creativos adultos: el checkpoint `exp_e14` genera vídeo directamente desde texto sin LoRAs auxiliares, lo que simplifica el pipeline frente al modelo original.
- Entrenamiento de LoRAs sobre el modelo: la model card recomienda explícitamente `exp_e14` como base para LoRAs, de modo que un tercero puede especializar aún más el modelo en un estilo o personaje concreto.
- Estudio de olvido catastrófico: la comparación entre los checkpoints originales y los experimentales ofrece un caso documentado de cómo el orden y la mezcla de datos afectan a la retención de conocimiento en modelos de difusión.
- Evaluación de seguridad y moderación: sirve como muestra controlada para probar clasificadores de contenido y políticas de filtrado en plataformas que alojan modelos generativos.
- Análisis de sesgos y representación: el dataset de origen (subreddits) permite estudiar qué temas, cuerpos y estéticas quedan sobrerrepresentados en el modelo resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FVD, CLIP score, MMLU ni equivalentes) ni comparaciones cuantitativas con el modelo base u otros ajustes finos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del modelo base de 1.3B en difusión de vídeo, se requiere habitualmente una GPU con al menos 8–16 GB en fp16, pero este dato no está confirmado por el autor para este ajuste fino.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el tamaño de parámetros (1.3B) sugiere que podría caber en GPUs de consumo de gama alta, pero no hay verificación publicada.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el pipeline oficial de Wan).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSFW Wan 1.3B (este) | 1.3B | no disponible | Texto-a-vídeo NSFW | CreativeML OpenRAIL-M | Hugging Face |
| Wan-AI/Wan2.1-T2V-1.3B | 1.3B | no disponible | Texto-a-vídeo general | no disponible en esta ficha | Hugging Face |
| Alternativas NSFW de vídeo abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa posible es con el modelo base, del que este es un ajuste fino. No se dispone de información sobre otros ajustes finos NSFW comparables de la misma familia o tamaño.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material para adultos y no es apto para todos los públicos; el repositorio está marcado como `not-for-all-audiences`.
- Artefactos anatómicos: el propio autor documenta "body horror", distorsiones y degradación de calidad en los checkpoints originales, especialmente a partir de la época 3; los experimentales mitigan el problema pero no hay garantía de eliminación total.
- Sesgos de dominio: el entrenamiento proviene de subreddits NSFW, lo que introduce sesgos de representación, estética y temática propios de esas comunidades.
- Riesgo de alucinación visual: como modelo generativo, puede producir anatomía, movimiento o perspectivas incoherentes, especialmente en prompts alejados de la distribución de entrenamiento.
- Idiomas: no se documenta soporte multilingüe; las leyendas y la guía de prompting están en inglés, por lo que los prompts en otros idiomas pueden degradar los resultados.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (cláusulas de uso aceptable del OpenRAIL); es responsabilidad del usuario verificar el cumplimiento, especialmente en lo relativo a contenido adulto y legislación local.
- Falta de benchmarks: no hay métricas objetivas publicadas, por lo que la calidad debe evaluarse empíricamente.
- Tamaño del repositorio: 105,4 GB, lo que implica requisitos de almacenamiento considerables y descargas lentas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; el modelo es muy reciente y carece de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Yosepx/NSFW_Wan_1.3B
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Guía de prompting incluida en el repo: `prompting-guide.json` (referenciada en la model card, sin URL directa publicada)
