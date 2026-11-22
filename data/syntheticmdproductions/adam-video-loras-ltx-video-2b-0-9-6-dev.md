# SyntheticMDProductions/ADAM-Video-LoRAs-LTX-Video-2B-0.9.6-Dev

## Resumen

ADAM-Video-LoRAs-LTX-Video-2B-0.9.6-Dev es una colección de diez adaptadores LoRA de atención para generación de vídeo, desarrollados por SyntheticMDProductions sobre el checkpoint LTX-Video 2B 0.9.6 Dev de Lightricks. Cada adaptador se activa mediante una palabra de disparo (trigger word) y se ha entrenado con el formato propietario ADAM PEFT Attention v1, un esquema de adaptación que el autor documenta exclusivamente a través de su herramienta LoRAVideoTrainer. El paquete no incluye pesos completos: el repositorio ocupa aproximadamente 0,1 GB y contiene únicamente los ficheros Safetensors de los adaptadores junto con la licencia heredada del modelo base.

El modelo base subyacente, LTX-Video 2B 0.9.6 Dev, es un modelo de difusión texto-a-vídeo de 2.000 millones de parámetros desarrollado por Lightricks, sobre el que estos LoRA añaden estilos y temáticas concretas: estética de "backrooms", entornos de Minecraft, Roblox o Subnautica, así como referencias a creadores de contenido y franquicias específicas. La relevancia de esta publicación es acotada: se trata de un artefacto de nicho, sin descargas ni interacciones registradas en el momento de la ficha, orientado a usuarios que ya trabajan con el ecosistema LTX-Video y con la herramienta de entrenamiento del autor.

Es importante subrayar que el propio autor advierte de que la generación con estas copias de publicación en una instalación limpia "aún está por verificar", lo que sitúa el artefacto en un estado declaradamente experimental. No se dispone de información sobre composición del dataset de entrenamiento, hiperparámetros, número de pasos ni evaluación cuantitativa o cualitativa de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de atención sobre modelo de difusión texto-a-vídeo (LTX-Video); formato ADAM PEFT Attention v1 |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base LTX-Video 2B tiene 2.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | LTX-Video Open Weights License 0.x (con restricciones de uso en la Sección 4 y el Anexo A) |
| Formato de pesos | Safetensors (un fichero por adaptador) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA aplicados exclusivamente a las capas de atención del modelo de difusión LTX-Video 2B 0.9.6 Dev, según indica el autor ("video-only attention LoRAs"). El formato de serialización es ADAM PEFT Attention v1, un esquema propio del ecosistema ADAM que no corresponde a los formatos PEFT estándar de Hugging Face, lo que implica que la carga de estos ficheros requiere la herramienta LoRAVideoTrainer del autor y no es directamente compatible con bibliotecas convencionales como `diffusers` o `peft` sin conversión previa. El repositorio incluye diez adaptadores independientes, cada uno con su propia palabra de disparo: `Backrooms_Footage`, `Looping_the_Rooms`, `Minecraft`, `nikocado_avocado`, `Roblox_Fun_Obby`, `SMDP`, `Spooky_Swings`, `Subnautica`, `Super_Mario_Logan` y `Ultrakill`.

No se han publicado datos sobre el volumen del dataset de entrenamiento, la composición de los clips de vídeo utilizados, el número de pasos de optimización, la tasa de aprendizaje ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se documenta si el entrenamiento empleó captions automáticas o anotaciones manuales, ni si se realizó algún tipo de validación cruzada entre adaptadores. La única indicación técnica relevante es la exigencia de usar exactamente el checkpoint `ltxv-2b-0.9.6-dev-04-25.safetensors` y su revisión concreta del repositorio de Lightricks, lo que sugiere una dependencia estricta de la versión del modelo base.

## Capacidades

- Generación de vídeo texto-a-vídeo condicionada por estilo: cada adaptador reproduce una estética o temática concreta al incluir su palabra de disparo en el prompt.
- Diez estilos diferenciados: estética "backrooms" (`Backrooms_Footage`, `Looping_the_Rooms`), videojuegos (`Minecraft`, `Roblox_Fun_Obby`, `Subnautica`, `Ultrakill`), referencias a creadores de contenido (`nikocado_avocado`, `Super_Mario_Logan`) y estilos varios (`Spooky_Swings`, `SMDP`).
- Compatibilidad exclusiva con LTX-Video 2B 0.9.6 Dev: no se declara compatibilidad con otras versiones del modelo base ni con otros modelos de vídeo.
- Integración con LoRAVideoTrainer: la generación se realiza desde la interfaz de la herramienta del autor, seleccionando el checkpoint y añadiendo la palabra de disparo al prompt.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada más allá del texto.
- Capacidades multilingües: no disponibles; el autor no especifica idiomas de los prompts.

## Casos de uso

- Producción de contenido para redes sociales con estética "backrooms": el adaptador `Backrooms_Footage` permite generar clips de vídeo con la iluminación fluorescente, pasillos repetitivos y textura de moqueta características de este género, útil para canales de terror analógico o creepypasta.
- Creación de material promocional para servidores de Minecraft: el adaptador `Minecraft` facilita generar planos de vídeo con la estética voxel del juego para tráilers de servidores, mapas personalizados o contenido para comunidades de jugadores.
- Vídeos de gameplay ficticio para Roblox: con `Roblox_Fun_Obby`, se pueden producir secuencias de obstáculos ("obby") con la estética de bloques del juego, aplicable a canales de contenido infantil o promoción de experiencias dentro de la plataforma.
- Contenido de terror atmosférico para eventos: `Spooky_Swings` y `Looping_the_Rooms` permiten generar planos inquietantes y bucles visuales para instalaciones de Halloween, escape rooms o vídeos de fondo en eventos temáticos.
- Vídeos de ambientación submarina para proyectos educativos o de ficción: `Subnautica` reproduce la estética del juego de supervivencia submarina, útil para material didáctico sobre ecosistemas marinos ficticios o para narrativa de ciencia ficción.
- Parodia y contenido de creadores: `nikocado_avocado` y `Super_Mario_Logan` permiten generar clips con referencias a figuras de la cultura de internet, orientados a canales de humor, memes o sátira, siempre que se respeten las restricciones de la licencia y los derechos de imagen de terceros.
- Prototipado rápido de estilos visuales para estudios de animación: los diez adaptadores sirven como banco de pruebas para evaluar cómo responde LTX-Video 2B a distintos estilos antes de invertir en un entrenamiento propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los adaptadores; el modelo base LTX-Video 2B requiere, según su tamaño, del orden de 8-16 GB de VRAM en precisión reducida, aunque el autor no especifica cifras para esta combinación.
- GPU recomendadas: no disponibles. El modelo base LTX-Video 2B está diseñado para ejecutarse en GPUs de consumo, pero no se documenta el rendimiento con estos LoRA.
- Cabe en GPU de consumo: presumiblemente sí, dado el tamaño del modelo base (2B), pero no se aporta confirmación ni modelo concreto.
- Opciones de despliegue: exclusivamente LoRAVideoTrainer (repositorio de GitHub del autor), que integra la descarga del modelo base, la carga del adaptador y la generación. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni `diffusers`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ADAM-Video-LoRAs-LTX-Video-2B-0.9.6-Dev | Adaptadores sobre base 2B | No disponible | LoRA texto-a-vídeo | LTX-Video Open Weights 0.x | Hugging Face, 0 descargas |
| LTX-Video 2B 0.9.6 Dev (Lightricks) | 2.000 M | No disponible | Difusión texto-a-vídeo | LTX-Video Open Weights 0.x | Hugging Face, modelo base |
| LoRA de estilo para LTX-Video (comunidad) | Adaptadores sobre base 2B | No disponible | LoRA texto-a-vídeo | Variable según autor | Hugging Face |
| Modelos texto-a-vídeo de mayor escala (p. ej., familia de 5B+) | No disponible | No disponible | Difusión texto-a-vídeo | Variable | Hugging Face |

La comparativa se limita a señalar la relación con el modelo base y con otros adaptadores de la comunidad; no se dispone de datos de rendimiento comparables para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Estado experimental: el propio autor indica que la generación con estas copias de publicación en una instalación limpia "aún está por verificar".
- Formato propietario: el esquema ADAM PEFT Attention v1 no es compatible con `peft` ni `diffusers` estándar; requiere LoRAVideoTrainer.
- Dependencia estricta de versión: solo funciona con el checkpoint `ltxv-2b-0.9.6-dev-04-25.safetensors` y su revisión concreta; otras versiones del modelo base pueden producir resultados incorrectos o fallos de carga.
- Sin datos de entrenamiento: no se documenta dataset, hiperparámetros ni evaluación, lo que impide reproducir o auditar los adaptadores.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar artefactos, incoherencias temporales y contenido no solicitado.
- Restricciones de licencia: la LTX-Video Open Weights License 0.x incluye limitaciones de uso en la Sección 4 y el Anexo A que deben revisarse antes de cualquier uso comercial; la licencia no es de código abierto plena.
- Derechos de terceros: adaptadores como `nikocado_avocado`, `Super_Mario_Logan`, `Minecraft`, `Roblox_Fun_Obby`, `Subnautica` y `Ultrakill` hacen referencia a personas, marcas o franquicias cuyos derechos pertenecen a sus titulares; el uso comercial puede infringir derechos de imagen o de propiedad intelectual.
- Idiomas no especificados: se desconoce si los prompts en castellano producen resultados equivalentes a los prompts en inglés.
- Sin métricas de calidad: no hay evaluación objetiva (FVD, CLIP score, evaluación humana) que permita comparar estos adaptadores con alternativas.
- Repositorio sin tracción: 0 descargas y 0 interacciones en el momento de la ficha, lo que reduce la probabilidad de soporte comunitario o resolución de problemas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SyntheticMDProductions/ADAM-Video-LoRAs-LTX-Video-2B-0.9.6-Dev
- Modelo base LTX-Video (Lightricks): https://huggingface.co/Lightricks/LTX-Video
- Checkpoint base requerido: https://huggingface.co/Lightricks/LTX-Video/blob/8984fa25007f376c1a299016d0957a37a2f797bb/ltxv-2b-0.9.6-dev-04-25.safetensors
- Licencia LTX-Video Open Weights 0.x: https://huggingface.co/Lightricks/LTX-Video/blob/8984fa25007f376c1a299016d0957a37a2f797bb/LTX-Video-Open-Weights-License-0.X.txt
- Herramienta LoRAVideoTrainer: https://github.com/dreamsartificial648-sketch/LoRAVideoTrainer#modelscope-and-ltx-video-2b
