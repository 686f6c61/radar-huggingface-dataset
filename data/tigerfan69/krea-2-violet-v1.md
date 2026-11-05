# TigerFan69/Krea-2-Violet-v1

## Resumen

Krea 2 Violet v1.0 es un adaptador LoRA de personaje para el modelo base de generación de imágenes Krea 2 Raw, desarrollado por el usuario TigerFan69. No se trata de un modelo fundacional, sino de un ajuste fino ligero (228,6 MB, 512 tensores en fp16) que inyecta en el modelo base la identidad visual de un personaje ficticio original llamado Violet. El paquete contiene únicamente los pesos del adaptador y unas instrucciones neutras de uso; no incluye imágenes de entrenamiento ni previsualizaciones generadas.

El adaptador se distribuye como un fichero `.safetensors` compatible con flujos de trabajo de Krea 2 en ComfyUI, y emplea el trigger `Violet-NotaRealPerson` para activar la representación del personaje. Según los metadatos internos del safetensors, el entrenamiento se realizó durante 1.500 pasos hasta la época 49 sobre el modelo Krea 2.

Su relevancia es acotada: se trata de un LoRA de nicho, sin descargas ni interacciones registradas en HuggingFace en el momento de la consulta, orientado a la generación de retratos y escenas consistentes de un personaje concreto dentro del ecosistema Krea 2. La licencia es la Krea 2 Community License, que restringe el uso comercial y la redistribución de pesos y fusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2 Raw |
| Parametros totales | no disponible (adaptador de 228.587.264 bytes, 512 tensores en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, no aplica contexto de texto) |
| Tipos de cuantizacion | fp16 (pesos del adaptador); las cuantizaciones dependen del modelo base |
| Idiomas soportados | en (ingles) |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango que se aplica sobre Krea 2 Raw, un modelo de difusión text-to-image. Los metadatos del safetensors identifican el modelo base como Krea 2, con 1.500 pasos de entrenamiento y época 49, y el fichero contiene 512 tensores en fp16 con un total de 228.587.264 bytes. El SHA-256 publicado (`8ae125823825aaec59a9d6dfd3412c3131e62ff1ae14660e27acaf2f8cd059fb`) identifica el archivo exacto y coincide con el publicado en Civitai antes del empaquetado, según indica el autor.

No se detalla en la información disponible la composición del dataset de entrenamiento, el número de imágenes empleadas, la resolución, ni si se aplicaron técnicas como regularización o captioning diferencial. Tampoco se especifica el rango del LoRA ni los módulos del transformer de difusión sobre los que se inyectan los pesos. El autor indica que no se realizó una generación ni un benchmark de calidad nuevos para esta sincronización, por lo que no hay métricas objetivas de fidelidad del personaje ni de degradación del modelo base.

## Capacidades

- Generación de imágenes text-to-image de un personaje ficticio concreto (Violet) mediante el trigger `Violet-NotaRealPerson`.
- Creación de retratos y escenas del personaje sobre el modelo base Krea 2 Raw.
- Compatibilidad con flujos de trabajo de Krea 2 en ComfyUI mediante un loader de LoRA compatible.
- Aplicable a distintas intensidades de fuerza del adaptador, sin que el autor declare un rango de fuerza probado universal.
- No incluye capacidades de texto, código, razonamiento, tool calling, agentes ni visión más allá de la generación de imágenes del modelo base.
- Soporte multilingüe limitado al inglés en las etiquetas del repositorio.

## Casos de uso

- Ilustración de personaje consistente: usar el trigger `Violet-NotaRealPerson` junto con el modelo Krea 2 Raw para generar retratos del personaje manteniendo su identidad visual a lo largo de varias imágenes, variando prompts de escena y semilla.
- Creación de material narrativo: generar escenas ilustradas para relatos o cómics amateur donde el personaje aparece en distintos entornos, apoyándose en la consistencia que aporta el LoRA.
- Prototipado de personajes para proyectos creativos: emplear el adaptador como base para explorar variaciones de vestuario, iluminación y encuadre antes de definir un diseño final.
- Pruebas de flujos ComfyUI: integrar el LoRA en un pipeline de Krea 2 para validar loaders, fuerzas de adaptador y combinaciones con otros LoRA sin sustituir por un flujo de FLUX.1, que el autor desaconseja explícitamente.
- Experimentación con fuerza de LoRA: comparar distintas intensidades con prompts y semillas fijas para evaluar identidad, anatomía, fondos y artefactos, tal como sugiere el autor.
- Uso educativo o de investigación sobre adaptadores de personaje: estudiar cómo un LoRA de 512 tensores modifica la generación de un modelo de difusión, siempre dentro de los términos de la licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende enteramente del modelo base Krea 2 Raw y de su cuantización; el adaptador añade solo 228,6 MB de pesos en fp16.
- GPU recomendadas: no disponible en la información proporcionada; vendrán determinadas por los requisitos del modelo base.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantización empleada.
- Opciones de despliegue: ComfyUI con un loader de LoRA compatible con Krea 2; el autor indica explícitamente no sustituir por un flujo de FLUX.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Violet v1.0 (TigerFan69) | LoRA de personaje sobre Krea 2 Raw | 228,6 MB (512 tensores fp16) | no aplica | krea-2-community-license | HuggingFace y Civitai |
| Krea 2 Raw (krea) | Modelo base text-to-image | no disponible | no aplica | Krea 2 Community License | HuggingFace |
| Otros LoRA de personaje para Krea 2 | Adaptadores de bajo rango | no disponible | no aplica | variable según autor | Civitai / HuggingFace |

No se dispone de datos de benchmarks ni de otros adaptadores comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo base: requiere obtener Krea 2 Raw y su text encoder/VAE por separado y bajo sus propios términos.
- El trigger correcto es `Violet-NotaRealPerson`; el autor advierte que etiquetas de listado y nombres internos pueden diferir y que el SHA-256 es el identificador fiable del archivo.
- No se declara un rango de fuerza probado; es necesario evaluar identidad, anatomía, fondos y artefactos a distintas intensidades.
- No se realizó generación ni benchmark de calidad para esta sincronización, por lo que no hay garantías documentadas de fidelidad o robustez.
- Licencia Krea 2 Community License: la descarga gratuita no implica uso comercial sin restricciones ni permiso para vender modelos o fusiones; la licencia MIT del software LoRA Studio no se aplica a estos pesos.
- El repositorio no incluye imágenes de entrenamiento ni previsualizaciones, lo que dificulta evaluar el resultado antes de descargar.
- Idioma de prompts limitado al inglés según las etiquetas del repositorio.
- Riesgo de alucinación visual y artefactos propio de los modelos de difusión, no cuantificado por el autor.
- Sin descargas ni interacciones registradas en HuggingFace en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/TigerFan69/Krea-2-Violet-v1
- Civitai (fuente): https://civitai.red/models/3034969?modelVersionId=3448439
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- LoRA Studio (software): https://github.com/TigerFan69/lora-studio
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Apoyo al autor (Ko-fi): https://ko-fi.com/tigerfan69/tiers
