# speridlabs/iris-3b

## Resumen

Iris-3B es un modelo de generación de imágenes texto-a-imagen de aproximadamente 3.000 millones de parámetros (2.987.511.888 según los pesos publicados en safetensors) desarrollado por SperidLabs. Su particularidad es que trabaja íntegramente en el espacio de píxeles: no usa VAE ni espacio latente comprimido, de modo que la propia red transformer de difusión predice cada píxel de la imagen final. Con los ajustes por defecto (CFG 3 y 100 pasos de muestreo) genera imágenes de 1024×1024, y el modelo se entrenó desde cero con un currículum de resolución 256 → 512 → 1024.

Más allá de la generación, el mismo prior generativo en espacio de píxeles se reutiliza, mediante ajuste fino y sin cambios de arquitectura, como "general vision learner" para tareas densas: estimación de profundidad monocular, restauración de imagen y reescalado. El repositorio incluye carpetas separadas para estas capacidades (`depth/` y `upscaler/`), además de los pesos de texto-a-imagen.

El interés del modelo es doble. Por un lado, demuestra que un transformer de difusión en espacio de píxeles es escalable a 3B de parámetros y competitivo: el paper lo compara con Qwen-Image en la evaluación OneIG a 1024² sin recurrir a VAE. Por otro, aporta un resultado negativo relevante, ya que en profundidad monocular y restauración 4x sobre DIV2K el prior en espacio de píxeles no ofreció una ventaja significativa frente a las alternativas evaluadas. La licencia es Apache 2.0 y los pesos están publicados en HuggingFace, con un codificador de texto Qwen3-VL-4B-Instruct que se descarga automáticamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión en espacio de píxeles (pixel-space diffusion transformer) entrenado con flow matching; sin VAE ni espacio latente |
| Parámetros totales | 2.987.511.888 (aproximadamente 3,0 mil millones) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible. El prompt se procesa con el codificador de texto Qwen3-VL-4B-Instruct; la model card no especifica el límite de tokens |
| Tipos de cuantización | No disponible. No se documentan pesos GGUF, AWQ, GPTQ ni variantes de precisión reducida |
| Idiomas soportados | No disponible. La model card recomienda escribir los prompts como frases descriptivas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |
| Resolución de salida | 1024×1024 por defecto; aspect ratios nativos de aproximadamente un megapíxel; currículum de entrenamiento 256 → 512 → 1024 |
| Pasos de denoising | 100 por defecto (configurable con `--steps`) |
| Escala CFG | 3 por defecto (configurable con `--cfg-scale`) |
| Codificador de texto | Qwen3-VL-4B-Instruct, se descarga automáticamente en la primera ejecución |
| Tareas adicionales incluidas | Estimación de profundidad monocular (`depth/`), restauración y reescalado de imagen (`upscaler/`) |
| Tamaño del repositorio | 41,9 GB (aproximadamente 12 GB texto-a-imagen, 12 GB `depth/`, 12 GB `upscaler/`) |
| Requisitos de software | Python 3.11+ y PyTorch 2.7.1+; GPU NVIDIA con CUDA |
| Fecha de publicación | 5 de octubre de 2026 (última actualización: 8 de octubre de 2026) |

## Arquitectura y entrenamiento

Iris-3B es un transformer de difusión que opera directamente sobre píxeles y se entrena con flow matching. A diferencia de los generadores habituales, que comprimen la imagen a un latente y delegan la reconstrucción en un decodificador, aquí la red produce la imagen completa, lo que evita la pérdida de información asociada a un latente con sesgo hacia las texturas. El entrenamiento se realizó desde cero siguiendo un currículum de resolución creciente 256 → 512 → 1024, precedido por una fase de ablación a 256² en la que se estudiaron el objetivo de predicción y la alineación de representaciones (REPA) para decidir qué componente escalar. La model card indica que el modelo funciona a resoluciones nativas de aproximadamente un megapíxel.

El paper también describe la conversión de un modelo latente preentrenado, FLUX.2 Klein base 4B, al espacio de píxeles, lo que sirve como comparación entre ambos paradigmas. La parte de "general vision learner" se apoya en el mismo prior generativo: con ajuste fino y sin modificar la arquitectura, el modelo aborda estimación de profundidad monocular y restauración/reescalado. El control de la generación se expone mediante parámetros de muestreo (escala CFG, número de pasos, semilla, prompt negativo y un fichero de texto con un prompt por línea para lotes). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO, algo poco habitual en modelos de difusión.

## Capacidades

- Generación de imágenes texto-a-imagen en espacio de píxeles a 1024×1024 por defecto y a aspect ratios nativos de aproximadamente un megapíxel.
- Generación sin VAE: la red emite directamente los píxeles, lo que preserva detalle fino y evita el sesgo de textura de los latentes comprimidos.
- Estimación de profundidad monocular mediante los pesos ajustados incluidos en la carpeta `depth/`.
- Restauración de imagen y superresolución con los pesos de `upscaler/`; el paper evalúa restauración 4x sobre DIV2K.
- Uso como prior generativo para tareas densas de visión, en la línea de un "general vision learner" alternativo a modelos fundacionales como DINOv2.
- Control fino del muestreo: escala CFG, número de pasos, semilla fija para reproducibilidad, prompt negativo y modo por lotes leyendo un fichero de prompts.
- Seguimiento de prompts descriptivos en inglés con vocabulario visual detallado (iluminación, materiales, estilo fotográfico).
- No soporta tool calling ni function calling: es un modelo de difusión orientado a imagen, no un LLM conversacional.
- No se documenta soporte de agentes, razonamiento multi-paso, audio ni vídeo en la información disponible.
- Capacidades multilingües: no documentadas; la model card recomienda explícitamente prompts en inglés.

## Casos de uso

- Generación de imágenes fotorrealistas para publicaciones y marketing: con prompts descriptivos en inglés y CFG 3 se obtienen retratos y escenas a ~1 megapíxel aptos para web y redes, con control de semilla para reproducir resultados aprobados.
- Ilustración y concept art con composiciones no cuadradas: al trabajar con aspect ratios nativos, permite generar directamente formatos panorámicos o verticales sin recortes posteriores que degraden el encuadre.
- Generación por lotes para catálogos y pruebas A/B: la opción `--txt-file` acepta un prompt por línea, lo que facilita producir variantes masivas de un mismo concepto o estilo para selección posterior.
- Estimación de profundidad monocular en pipelines de reconstrucción 3D o realidad aumentada: los pesos de `depth/` proporcionan un mapa de profundidad denso por imagen que puede alimentar etapas de mallado o segmentación por planos.
- Restauración de fotografía antigua o de archivo: el módulo `upscaler/` permite recuperar detalle y aumentar resolución, un flujo típico en digitalización de fondos documentales y colecciones históricas.
- Superresolución 4x para impresión: el paper evalúa explícitamente restauración 4x sobre DIV2K, un escenario directamente aplicable a preparar material de baja resolución para soportes impresos.
- Investigación en priors generativos como alternativa a modelos fundacionales de visión: el modelo puede emplearse como extractor o prior congelado en tareas densas y compararse con enfoques tipo DINOv2, que es precisamente el marco experimental del paper.
- Generación de datos sintéticos para entrenar otros modelos: producir imágenes con atributos controlados (iluminación, encuadre, materiales) permite ampliar datasets de visión sin depender de datos reales etiquetados.
- Ajuste fino sobre un prior en espacio de píxeles: al no requerir cambios de arquitectura para pasar de generación a tareas densas, resulta un punto de partida razonable para adaptar el modelo a dominios verticales (medicina, industria, teledetección) con presupuestos de cómputo moderados.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La información recuperada describe las evaluaciones de forma cualitativa, sin tablas de métricas, por lo que no se reproducen cifras.

| Evaluación | Modelo comparado | Resultado descrito |
|---|---|---|
| OneIG a 1024² | Qwen-Image | Se reporta que Iris-3B iguala a Qwen-Image sin usar VAE (dato cualitativo, sin cifras disponibles) |
| Profundidad monocular | Alternativas evaluadas en el paper | Resultado negativo: el prior en espacio de píxeles no aportó una ventaja significativa |
| Restauración 4x sobre DIV2K | Alternativas evaluadas en el paper | Resultado negativo: el prior en espacio de píxeles no aportó una ventaja significativa |
| Conversión de modelo latente a píxeles | FLUX.2 Klein base 4B | Conversión descrita en el paper; sin métricas disponibles en la información proporcionada |

## Requisitos de hardware

- Pesos del modelo texto-a-imagen: aproximadamente 12 GB según la model card; las carpetas `depth/` y `upscaler/` añaden unos 12 GB cada una, hasta un total de 41,9 GB en el repositorio completo.
- Codificador de texto: Qwen3-VL-4B-Instruct, que se descarga automáticamente; en bf16 supondría del orden de 8 GB adicionales de memoria y de espacio en disco (estimación derivada del número de parámetros, no confirmada por el autor).
- GPU recomendadas: no documentadas. La model card únicamente exige una GPU NVIDIA con CUDA; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Viabilidad en GPU de consumo: no confirmada. Los ~12 GB de pesos más el codificador de texto exceden tarjetas de 8 GB; en una GPU de 24 GB como la RTX 4090 encajarían en principio los pesos y el codificador, pero el coste de activaciones en espacio de píxeles a 1024² no está documentado.
- Opciones de despliegue: el flujo oficial es clonar el repositorio de GitHub, instalar el paquete con `pip install -e .` y ejecutar `scripts/sample.py`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, opciones que en cualquier caso no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. Conviene tener en cuenta que los 100 pasos de denoising por defecto implican 100 evaluaciones del transformer por imagen generada, y que reducir el número de pasos acelera la inferencia a costa de detalle.
- Almacenamiento y descarga: la descarga selectiva con `--exclude "depth/*" "upscaler/*"` limita la descarga inicial a los pesos de texto-a-imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Espacio de representación | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Iris-3B | 2,99 mil millones | Píxeles (sin VAE) | Apache 2.0 | Pesos safetensors en HuggingFace | Generación + profundidad + restauración/reescalado en el mismo repositorio |
| Qwen-Image | No disponible en la información proporcionada | Latente (con VAE) | No disponible | No disponible | Referencia de comparación en OneIG a 1024² según el paper |
| FLUX.2 Klein base 4B | 4 mil millones (versión base) | Latente convertido a píxeles en el paper | No disponible | No disponible | Usado como punto de partida para estudiar la conversión de latente a espacio de píxeles |
| DINOv2 | No disponible en la información proporcionada | No aplica (modelo fundacional de visión, no generativo) | No disponible | No disponible | Citado en el paper como alternativa para tareas densas de visión |

## Limitaciones y advertencias

- Resultado negativo documentado: en estimación de profundidad monocular y restauración 4x sobre DIV2K, el prior en espacio de píxeles no ofreció una ventaja significativa frente a las alternativas evaluadas, por lo que el argumento de superioridad del paradigma no se sostiene en esas tareas concretas.
- Idiomas: no hay idiomas declarados y la model card pide escribir prompts como frases descriptivas en inglés; el comportamiento con otros idiomas no está verificado.
- Riesgo de artefactos y de baja fidelidad al prompt: la propia documentación advierte de que subir la escala CFG hace que la imagen siga el prompt de forma más literal pero puede verse más dura, y que reducir los pasos de denoising degrada el detalle.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, culturales o de representación en la información disponible.
- Alucinación visual: como generador, puede producir contenido plausible pero incorrecto (anatomías, texto en la imagen, geometrías imposibles) sin que exista un mecanismo de verificación en el propio modelo.
- Requisito de hardware estricto: solo se soporta GPU NVIDIA con CUDA, y no hay versiones cuantizadas publicadas que permitan ejecución en equipos más modestos o en CPU.
- Dependencia del codificador de texto: la ejecución descarga Qwen3-VL-4B-Instruct de forma automática, lo que añade peso, tiempo de arranque y una dependencia externa con su propia licencia.
- Coste de inferencia: 100 pasos de denoising por imagen con un modelo de 3B de parámetros y activaciones a resolución completa implican un consumo de cómputo alto para uso interactivo.
- Madurez temprana: en el momento de redactar esta ficha el modelo acumula 18 descargas y 23 me gusta, con una licencia permisiva pero sin un ecosistema amplio de herramientas, cuantizaciones o integraciones de terceros.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del codificador de texto y de los datasets de entrenamiento, no detallados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/speridlabs/iris-3b
- Paper en arXiv: https://arxiv.org/abs/2610.09450
- PDF del paper: https://arxiv.org/pdf/2610.09450
- Página del proyecto: https://speridlabs.com/research/iris
- Sitio de SperidLabs: https://speridlabs.com/
- Repositorio de código: https://github.com/speridlabs/iris-3b
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/speridlabs/iris-3b
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Cobertura en AI Weekly: https://aiweekly.co/alerts/speridlabs-iris-3b-scales-pixel-space-diffusion-to-3b-params-matches-qwen-image
