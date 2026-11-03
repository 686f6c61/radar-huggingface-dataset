# TigerFan69/Krea-2-Jeanette-v1

## Resumen

Krea 2 Jeanette v1 es un adaptador LoRA de personaje para el modelo base Krea-2-Raw, orientado a la generación de retratos y escenas de un personaje ficticio original llamado Jeanette. Lo publica el usuario TigerFan69 en Hugging Face y Civitai, y no es un modelo autónomo: requiere descargar por separado el modelo base Krea 2 junto con su codificador de texto y VAE correspondientes, bajo sus propios términos. El paquete contiene únicamente los pesos del adaptador y unas instrucciones neutras, sin imágenes de entrenamiento ni previsualizaciones generadas.

El adaptador se distribuye en formato safetensors con precisión fp16, consta de 512 tensores y pesa 228.587.248 bytes (aproximadamente 0,2 GB). Los metadatos del archivo indican que se entrenó con 2.000 pasos hasta la época 83, con la etiqueta de modelo base "Krea 2" en Civitai. El disparador de activación es `Jeanette-V1` y está pensado para integrarse en flujos de trabajo de ComfyUI mediante un cargador de LoRA compatible con Krea 2, no con FLUX.1.

Su relevancia es acotada: se trata de un adaptador de personaje de nicho, con cero descargas y cero likes en el momento de la consulta, publicado para la comunidad de generación de imágenes con Krea 2. No se han publicado resultados de benchmarks ni evaluaciones de calidad para esta sincronización, y la licencia comunitaria de Krea 2 impone restricciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea-2-Raw; arquitectura del base no disponible |
| Parámetros totales | no disponible (228.587.248 bytes en fp16, 512 tensores) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de text-to-image) |
| Tipos de cuantización | no disponible; pesos distribuidos en fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | krea-2-community-license (enlace: https://krea.ai/krea-2-licensing) |
| Formato de pesos | safetensors (`krea2_jeanette-v1_07f689ed08f8.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de personaje, es decir, un conjunto de matrices de bajo rango que se acoplan al modelo base Krea-2-Raw para inducir la identidad visual de Jeanette. Los metadatos del safetensors identifican el modelo base como Krea 2, con 2.000 pasos de entrenamiento y época 83, y el archivo contiene 512 tensores en fp16. No se especifica en la información disponible el rango del LoRA, la tasa de aprendizaje, la composición del dataset de entrenamiento ni si se emplearon técnicas como regularización o captions estructurados.

No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras). El autor indica explícitamente que no se realizó una generación nueva ni un benchmark de calidad para esta sincronización, y que no se reclama un rango de fuerza universalmente probado: se recomienda partir de un flujo de trabajo compatible con Krea 2 y comparar fuerzas con prompts y semillas fijos.

## Capacidades

- Generación de imágenes text-to-image de retratos y escenas del personaje Jeanette, condicionada por el modelo base Krea 2.
- Inducción de identidad de personaje mediante el disparador `Jeanette-V1`.
- Compatibilidad con flujos de trabajo de ComfyUI a través de un cargador de LoRA específico para Krea 2.
- Ajuste de intensidad del adaptador (strength) para modular la influencia del personaje sobre la salida.
- Prompting en inglés, único idioma declarado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un adaptador de difusión para imágenes.
- No dispone de modo thinking, visión, audio ni capacidades multimodales más allá de la generación de imágenes.

## Casos de uso

- Retratos de personaje consistentes: usar el disparador `Jeanette-V1` con un flujo de trabajo Krea 2 en ComfyUI para generar retratos del personaje manteniendo rasgos reconocibles entre iteraciones, comparando fuerzas del LoRA con semillas fijas.
- Ilustración de narrativa serial: incorporar el adaptador a un pipeline de generación de viñetas o escenas de una historia con un elenco fijo, donde la consistencia de identidad del personaje es el requisito principal.
- Prototipado de personajes para juegos o cómics: generar hojas de personaje y variaciones de vestuario y pose sobre el modelo base, evaluando anatomía, fondos y artefactos a distintas intensidades.
- Pruebas de concepto de dirección de arte: comparar prompts y fuerzas del LoRA para decidir el estilo visual antes de encargar arte final, dado el bajo coste de iteración del adaptador.
- Exploración creativa personal: uso no comercial por parte de aficionados que ya dispongan del modelo base Krea 2 y su entorno ComfyUI configurado.
- Evaluación comparativa de adaptadores: servir como referencia en pruebas internas de calidad de LoRA de personaje frente a otros adaptadores del mismo modelo base, siempre que se respeten los términos de la licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó ninguna generación nueva ni benchmark de calidad para esta sincronización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende íntegramente del modelo base Krea 2, su codificador de texto y su VAE, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa unos 0,2 GB, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: ComfyUI con un cargador de LoRA compatible con Krea 2; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Jeanette v1 (TigerFan69) | LoRA de personaje sobre Krea-2-Raw | 228,6 MB en fp16, 512 tensores | no aplica | krea-2-community-license | Hugging Face y Civitai |
| Krea-2-Raw (krea) | Modelo base text-to-image | no disponible | no aplica | krea-2-community-license | Hugging Face |
| Otros LoRA de personaje para Krea 2 | Adaptadores de personaje | no disponible | no aplica | variable según autor | Civitai y Hugging Face |

No se dispone de datos de rendimiento ni de evaluaciones comparativas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base Krea 2, su codificador de texto y su VAE, el adaptador no es funcional.
- No debe usarse con flujos de trabajo de FLUX.1; el autor lo desaconseja explícitamente.
- No se ha publicado ningún benchmark de calidad, identidad, anatomía o artefactos; la evaluación queda enteramente en manos del usuario.
- No se reclama un rango de fuerza probado; es necesario experimentar con intensidades intermedias y revisar artefactos.
- Riesgo de sobreajuste o degradación de la salida fuera de las condiciones de entrenamiento, dado que no se documenta el dataset.
- Idioma limitado al inglés en los prompts.
- La licencia krea-2-community-license restringe el uso: la descarga gratuita no implica uso comercial sin restricciones ni permiso para vender modelos o fusiones. La licencia MIT del software LoRA Studio no se aplica a estos pesos.
- Es obligatorio leer LICENSE.pdf, NOTICE.txt y CREATOR-TERMS.md antes del uso, y otorgar crédito a TigerFan69.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validación comunitaria de su comportamiento.
- No se incluyen imágenes de entrenamiento ni previsualizaciones en el paquete, lo que dificulta verificar la fidelidad del personaje antes de generar.

## Enlaces

- Hugging Face: https://huggingface.co/TigerFan69/Krea-2-Jeanette-v1
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Fuente en Civitai: https://civitai.red/models/3027757?modelVersionId=3438902
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Software LoRA Studio: https://github.com/TigerFan69/lora-studio
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Apoyo al autor (Ko-fi): https://ko-fi.com/tigerfan69/tiers
