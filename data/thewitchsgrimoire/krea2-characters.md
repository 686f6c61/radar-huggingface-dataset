# TheWitchsGrimoire/Krea2-characters

## Resumen

Krea2-characters es una colección de LoRAs de personaje entrenadas de forma independiente sobre el modelo base Krea-2-Raw, un modelo de difusión texto-a-imagen desarrollado por Krea. La publica el usuario TheWitchsGrimoire bajo el paraguas "The Witch's Grimoire" y su función es inyectar identidades visuales consistentes de personajes concretos en las generaciones del modelo base, evitando la deriva facial que se produce al describir un personaje solo con prompt. En el momento de la ficha la colección incluye un único adaptador publicado, `twg_sohee v2`, con trigger `twg_sohee` y checkpoint recomendado de 2500 pasos.

Técnicamente se trata de un adaptador LoRA (no de un modelo completo) en formato safetensors, con un tamaño de repositorio de 0,3 GB, pensado para cargarse en ComfyUI desde `ComfyUI/models/loras/` y combinarse con Krea-2-Raw. No se publican parámetros totales del adaptador, dimensión de rango, contexto ni idiomas soportados, ya que son propiedades heredadas del modelo base y no se detallan en la información disponible.

Su relevancia es acotada pero clara para el nicho de generación de personajes: demuestra el flujo de trabajo habitual (LoRA por personaje, trigger dedicado, checkpoints intermedios con previews y workflows incluidos) sobre un modelo base reciente, y establece restricciones de uso explícitas —retratos respetuosos, moda y narrativa visual, sin contenido sexual ni explotador— que conviene leer junto con la licencia comunitaria de Krea 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión texto-a-imagen Krea-2-Raw |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (etiqueta `license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre Krea-2-Raw, el checkpoint "raw" del modelo Krea 2. La model card no especifica rango del adaptador, capas objetivo, tamaño del dataset de entrenamiento, número de imágenes por personaje ni si se aplicaron técnicas de regularización o captions automáticos. Sí se indica el checkpoint recomendado para `twg_sohee v2`: 2500 pasos, lo que sugiere un entrenamiento por pasos con checkpoints intermedios y previews asociadas a cada uno.

Cada personaje se distribuye en su propia carpeta con pesos, previews, instrucciones y workflows de generación, lo que refleja un pipeline orientado a ComfyUI. No hay información sobre el proceso de curación del dataset, el uso de imágenes sintéticas o reales, ni sobre el método de validación de identidad (similitud facial, revisión manual, etc.).

## Capacidades

- Generación texto-a-imagen de retratos y figuras de personaje con identidad visual consistente mediante el trigger `twg_sohee`.
- Inyección de rasgos faciales, peinado y estilo del personaje sobre el modelo base Krea-2-Raw sin necesidad de prompts descriptivos largos.
- Compatibilidad con el ecosistema ComfyUI: el safetensors se coloca en `ComfyUI/models/loras/` y se selecciona en el nodo loader.
- Inclusión de workflows de generación y previews por personaje en el repositorio.
- Soporte de estilos derivados del prompt (moda, retrato, narrativa visual), sujeto a las restricciones de uso del autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: no aplica a un adaptador de difusión.

## Casos de uso

- Previsualización de personajes para narrativa visual: usar `twg_sohee` junto con Krea-2-Raw en ComfyUI para generar variaciones de un mismo personaje en distintas escenas, manteniendo coherencia facial entre imágenes.
- Diseño de concept art para juegos o cómics: generar hojas de personaje (retrato, cuerpo completo, expresiones) con el trigger fijo y distintos prompts de vestuario y entorno.
- Pruebas de estilismo y moda: combinar el LoRA con prompts de indumentaria para explorar looks sobre una identidad constante, útil en moodboards.
- Ilustración editorial y storytelling: producir secuencias de imágenes con el mismo personaje para acompañar relatos, blogs o presentaciones.
- Evaluación de LoRAs sobre Krea 2: servir de referencia para comparar checkpoints (por ejemplo, 2500 pasos frente a otros) y medir estabilidad de identidad y fidelidad al trigger.
- Integración en pipelines de generación por lotes en ComfyUI: automatizar la producción de retratos con el workflow incluido y el checkpoint recomendado.
- Prototipado de personajes originales: usar el LoRA como base y entrenar variantes propias para derivar identidades nuevas dentro del mismo ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base Krea-2-Raw, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el repositorio ocupa 0,3 GB, pero el consumo real lo determina el modelo base.
- Opciones de despliegue: ComfyUI es el flujo documentado explícitamente (carpeta `ComfyUI/models/loras/` y nodo loader). Otros runners (Diffusers, vLLM, TGI, llama.cpp, Ollama) no se mencionan y, en el caso de los dos últimos, no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheWitchsGrimoire/Krea2-characters | LoRA de personaje | krea/Krea-2-Raw | no disponible | krea-2-community-license | Hugging Face, 0 descargas, 0 likes en el momento de la ficha |
| UntMods/Krea2_Chars_LoRA | LoRA de personajes | Krea 2 (text-to-image) | no disponible | no disponible en la información | Hugging Face |
| Krea Character AI (app) | Generador de personajes alojado | Propietario (Krea) | no disponible | servicio propietario | Plataforma web de Krea |

La comparación cuantitativa (parámetros, contexto, rendimiento) no está disponible para ninguno de los tres; la diferencia principal es el formato de entrega: adaptadores descargables frente a un servicio alojado.

## Limitaciones y advertencias

- La colección contiene un único personaje publicado (`twg_sohee v2`); no es un modelo generalista ni cubre múltiples identidades todavía.
- El autor restringe explícitamente el uso: nada de desnudos, pornografía, representaciones sexualizadas, humillación ni explotación. Es una petición del creador, distinta de los términos vinculantes de Krea.
- La licencia aplicable es la Krea 2 Community License, no MIT; cualquier uso comercial debe revisarse contra ese documento y contra la Acceptable Use Policy de Krea, que prohíbe imágenes íntimas no consentidas, explotación sexual infantil, acoso y difamación.
- Los LoRAs son tributos artísticos a personas reales según la model card; no implican afiliación ni respaldo de Krea ni de las personas representadas, lo que añade riesgo legal en usos comerciales o de imagen.
- Riesgo de sobreajuste al checkpoint de 2500 pasos y de deriva de identidad fuera de las condiciones probadas; no se documentan métricas de fidelidad.
- No hay información sobre sesgos demográficos, calidad multilingüe de prompts ni comportamiento con prompts en castellano.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha: no existe validación comunitaria ni evidencia de robustez en producción.
- No se especifican requisitos de hardware ni latencias, por lo que el coste de despliegue debe medirse empíricamente con el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/TheWitchsGrimoire/Krea2-characters
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia Krea 2 Community License: https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
- Krea Acceptable Use Policy: https://www.krea.ai/krea-2-use-policy
- Krea Character AI (app): https://www.krea.ai/apps/character-ai
- LoRA comparable de la comunidad: https://huggingface.co/UntMods/Krea2_Chars_LoRA
