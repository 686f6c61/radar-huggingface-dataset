# TeamUNLa/Ornith-1.5-35B-A3B-exl3-3.2bpw-hb8-vb4-mb4

## Resumen

Ornith-1.5-35B-A3B-exl3-3.2bpw-hb8-vb4-mb4 es una conversión cuantizada del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por TeamUNLa (Comunidad de Sistemas de la UNLa). No se trata de un modelo entrenado desde cero, sino de una redistribución en formato ExLlamaV3 (EXL3) con una cuantización no uniforme de 3,20 bits por peso efectivos, pensada para ejecutar un MoE de gran tamaño en equipos domésticos.

El modelo base es un Mixture of Experts de 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, lo que permite un coste computacional por token propio de un modelo mucho menor. La arquitectura, según los tags del repositorio, es qwen3_5_moe, con capas de atención lineal (linear_attn) combinadas con atención completa (self_attn) y expertos compartidos (shared_expert).

La relevancia de esta variante es práctica: reduce la huella de descarga a 15 GB y permite arrancar con 8 GB de VRAM si se reparten capas y expertos entre VRAM y RAM del sistema, con un total recomendado de unos 32 GB de memoria combinada. Está orientada a inferencia local con TabbyAPI y a su uso como agente en entornos como VS Code, con licencia MIT y soporte declarado de español e inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con atención lineal y atención completa; expertos compartidos |
| Parametros totales | 35B (modelo base); 8.032.370.688 parámetros almacenados en los safetensors de esta variante cuantizada |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,20 bpw efectivos, asignación no uniforme (hb8-vb4-mb4): 8 bpw en linear_attn, self_attn, shared_expert y lm_head; 2,5-3 bpw en expertos enrutados intermedios; 3,5-6 bpw en capas de borde |
| Idiomas soportados | es, en |
| Licencia | MIT |
| Formato de pesos | safetensors en formato ExLlamaV3 (EXL3); no compatible con transformers estándar pese al tag de librería |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts con 35B parámetros totales y ~3B activos por token, organizado en 40 capas (índices 0-39 según la receta de cuantización). Combina bloques de atención lineal (linear_attn) con bloques de atención completa (self_attn), e incluye un shared_expert además de los expertos enrutados por capa. Esta combinación de atención lineal y MoE reduce el coste de cómputo y memoria frente a un transformer denso equivalente.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento, ya que la model card de esta variante solo documenta el proceso de cuantización. La innovación técnica destacable de esta publicación es la receta de cuantización: en lugar de aplicar una tasa uniforme, se asignan bits por tensor, reservando 8 bpw para los tensores críticos (atención, experto compartido y lm_head), 2,5-3 bpw para los expertos enrutados de las capas intermedias (5-34) y precisión escalonada en las capas de borde (0-2 y 37-39) para preservar calidad de razonamiento y código.

## Capacidades

- Generación de texto conversacional en español e inglés, según los idiomas declarados en el repositorio.
- Razonamiento y generación de código: la receta de cuantización se diseñó explícitamente para preservar calidad en razonamiento y programación.
- Procesamiento de imagen y texto: el tag image-text-to-text del repositorio indica capacidades multimodales de entrada, aunque no se detallan en la model card.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: el autor sugiere su uso como agente en VS Code y otros IDEs mediante TabbyAPI, con API compatible con OpenAI.
- Capacidades multilingües limitadas a es y en según los metadatos.
- No se documentan modos especiales (thinking mode, audio, decodificación especulativa) en la información disponible.

## Casos de uso

- Asistente de programación en IDE: el modelo puede levantarse como servidor local compatible con la API de OpenAI mediante TabbyAPI y conectarse a VS Code u otros IDEs como agente de autocompletado y refactorización, aprovechando la preservación de calidad en código de la receta de cuantización.
- Inferencia local en PC doméstico: con 15 GB de descarga y arranque desde 8 GB de VRAM con offloading a RAM, es viable en equipos de gama media con GPU consumer, sin depender de servicios en la nube.
- Atención al cliente en español: el soporte nativo de español y su naturaleza conversacional permiten desplegar un asistente multi-turno local para pymes que necesiten privacidad de datos.
- Procesamiento de documentos con imagen y texto: el tag image-text-to-text sugiere uso en tareas de extracción o descripción de contenido visual combinado con instrucciones textuales, aunque la model card no detalla el pipeline.
- Laboratorio de experimentación con MoE cuantizados: útil para investigadores que quieran estudiar el impacto de cuantizaciones agresivas (2,5-3 bpw) en expertos enrutados sobre la calidad final, comparando con el modelo base sin cuantizar.
- Despliegue en estaciones con GPU AMD: TabbyAPI soporta ROCm, por lo que el modelo puede ejecutarse en GPUs RX 7000 o RX 6800 y superiores, ampliando las opciones de hardware frente a alternativas solo CUDA.
- Generación de texto en entornos con restricciones de red: al ser un modelo local con licencia MIT, puede desplegarse en infraestructuras aisladas sin conexión externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima recomendada: 8 GB, repartiendo capas y expertos entre VRAM y RAM del sistema.
- Memoria total recomendada (VRAM + RAM): aproximadamente 32 GB.
- Tamaño de descarga: 15,0 GB.
- GPU compatibles con CUDA: cualquier GeForce GTX 10 o superior con VRAM suficiente, según la model card.
- GPU compatibles con ROCm: serie RX 7000 o más nueva; RX 6800 y superiores de la serie RX 6000 deberían funcionar aunque no fueron probados.
- GPUs Intel: no soportadas.
- Opciones de despliegue: TabbyAPI (ExLlamaV3), que expone una API compatible con OpenAI. No es compatible con llama.cpp, Ollama ni TGI, ya que el formato EXL3 requiere el runtime de ExLlamaV3.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados: temperature=0,75, top_p=0,95, top_k=20, min_p=0,0, presence_penalty=0,6.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-exl3-3.2bpw (esta variante) | 35B | ~3B | no disponible | EXL3 | MIT | Cuantización comunitaria no uniforme, 15 GB, orientada a PC doméstico |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B | ~3B | no disponible | safetensors | MIT | Modelo original sin cuantizar; mayor huella de memoria |
| Alternativas MoE de ~30-35B con ~3B activos | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización a 2,5-3 bpw en los expertos enrutados intermedios puede degradar la calidad frente al modelo base, especialmente en tareas de razonamiento complejo o código de alta precisión; no se han publicado evaluaciones comparativas que cuantifiquen esa pérdida.
- El formato EXL3 solo es compatible con ExLlamaV3 y TabbyAPI; no funciona con transformers estándar, llama.cpp, Ollama ni TGI, pese a que el repositorio declara library_name transformers.
- El contexto máximo no está documentado en la información disponible, por lo que no debe asumirse una ventana larga sin verificarla en el modelo base.
- Idiomas limitados a español e inglés según los metadatos; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad ni de sesgos.
- No se documentan sesgos conocidos ni resultados de red teaming en la información proporcionada.
- Aunque la licencia es MIT, conviene revisar la licencia del modelo base enlazada en la model card antes de un despliegue comercial, ya que esta variante hereda las condiciones del original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria amplia del comportamiento real de esta cuantización.
- Las GPUs Intel no están soportadas y el soporte ROCm en RX 6000 no ha sido probado por el autor.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-3.2bpw-hb8-vb4-mb4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Índice de modelos de TeamUNLa: https://huggingface.co/TeamUNLa/LLMs-UNLa
- ExLlamaV3 (herramienta de cuantización y runtime): https://github.com/turboderp-org/exllamav3
- TabbyAPI (servidor compatible con OpenAI): https://github.com/theroyallab/tabbyAPI
