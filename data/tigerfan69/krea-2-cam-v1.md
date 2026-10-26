# TigerFan69/Krea-2-Cam-v1

## Resumen

Krea-2-Cam-v1 es un adaptador LoRA de personaje para el modelo de difusión text-to-image Krea 2, publicado por el creador independiente TigerFan69. No se trata de un modelo base: el repositorio contiene únicamente los pesos del adaptador (114.324.752 bytes en fp16, 512 tensores) que se cargan sobre una instancia de Krea 2 o Krea 2 Turbo descargada por separado bajo sus propios términos. Su función es fijar la identidad de «Cam», un personaje femenino adulto de ficción, para generar retratos y escenas con consistencia visual entre imágenes.

El adaptador se entrenó con AI Toolkit 0.13.30 durante 2.000 pasos hasta la época 68 y se activa incluyendo la palabra clave `Camv1` en el prompt. Está pensado para flujos de trabajo en ComfyUI (carpeta `models/loras/`) y su licencia es la Krea 2 Community License Agreement, complementada con términos adicionales del creador que restringen la reventa de imágenes, la publicación de merges y el uso del adaptador en servicios de generación distintos de los autorizados.

Su relevancia es acotada y de nicho: interesa a quien ya trabaje con Krea 2 y necesite consistencia de personaje en ilustración, storyboard o preproducción. No hay métricas publicadas, el repositorio no incluye dataset ni workflow completo, y las restricciones de licencia son más estrictas que las de un LoRA convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre un transformer de difusión text-to-image (Krea 2); rango, módulos objetivo y detalles de la arquitectura base: no disponibles |
| Parámetros totales | Aproximadamente 57 M en el adaptador (derivado de 114.324.752 bytes en fp16 y 512 tensores); el modelo base no se incluye ni se cuantifica en la información disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la longitud del prompt la determina el codificador de texto de Krea 2 (límite no disponible) |
| Tipos de cuantización | Solo fp16 en safetensors; no se publican versiones cuantizadas del adaptador. Cuantizaciones del modelo base: no disponibles |
| Idiomas soportados | Inglés (`en`); los prompts deben redactarse en inglés |
| Licencia | Krea 2 Community License Agreement + términos del creador (`license: other`, `krea-2-community-license`) |
| Formato de pesos | safetensors (fp16), 512 tensores |
| Modelo base requerido | Krea 2; el autor declara compatibilidad también con Krea 2 Turbo |
| Palabra de activación | `Camv1` |
| Tamaño del archivo | 114.324.752 bytes (~109 MiB); tamaño del repositorio 0,1 GB |
| SHA-256 | `dc191ed24567e36f01d62c60f3fa0df9d028ab7ceb708df8732f696e3311db35` |
| Entrenamiento declarado | AI Toolkit 0.13.30, 2.000 pasos, época 68, versión v1.0 |
| Fecha de publicación | 25 de octubre de 2026 (según Hugging Face); última actualización el mismo día |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El archivo es un adaptador LoRA estándar en fp16 con 512 tensores, pensado para inyectarse en las capas del transformer de difusión de Krea 2. El autor no documenta el rango (rank), el alpha, los módulos objetivo ni la proporción de parámetros entrenables respecto al modelo base, por lo que no es posible evaluar el compromiso entre capacidad de identidad y pérdida de flexibilidad del base. Tampoco se publica la arquitectura interna de Krea 2 en la información disponible, más allá de su naturaleza de modelo de difusión text-to-image.

El entrenamiento se realizó con AI Toolkit 0.13.30 en 2.000 pasos, con un total de 68 épocas según los metadatos del adaptador. La relación entre pasos y épocas sugiere un conjunto de datos pequeño, del orden de decenas de imágenes, aunque la composición del dataset, el proceso de captioned y cualquier técnica de regularización no están documentados. No se menciona uso de RLHF, DPO ni preferencias humanas, algo esperable en un adaptador de identidad. El paquete no incluye imágenes explícitas y el autor declara que el personaje no representa a ninguna persona real.

## Capacidades

- Generación de retratos y escenas de un personaje femenino adulto ficticio con identidad consistente entre generaciones, condicionada por la palabra clave `Camv1`.
- Transferencia de identidad a distintos encuadres, vestuario e iluminación descritos en el prompt (la robustness frente a cambios de escena no está medida).
- Integración como adaptador en flujos de trabajo de ComfyUI compatibles con LoRA de Krea 2.
- Compatibilidad declarada con Krea 2 y Krea 2 Turbo, lo que en principio permite reducir el número de pasos de muestreo con la variante Turbo (no verificado de forma independiente).
- Control mediante los parámetros habituales del ecosistema: fuerza del LoRA, prompt, seed y sampler del modelo base.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni procesamiento de audio o vídeo: es un adaptador de generación de imágenes, no un modelo de lenguaje.
- Capacidad multilingüe limitada al inglés; no hay evidencia de funcionamiento fiable con prompts en castellano.

## Casos de uso

- Ilustración de narrativa seriada: mantener el mismo rostro y proporciones del personaje a lo largo de capítulos o tiras, variando vestuario y localización mediante el prompt y reutilizando la semilla para controlar la composición.
- Preproducción audiovisual y storyboard: generar fotogramas de referencia con un personaje estable para presentar dirección de arte antes de rodaje o animación, dentro de un pipeline local en ComfyUI.
- Novela visual y ficción interactiva: producir retratos de expresión y pose para un elenco ficticio, con el adaptador fijando la identidad y el prompt describiendo el estado emocional y la escena.
- Prototipado de personajes para videojuegos: explorar variaciones de diseño y vestuario de un personaje no jugador antes de encargar el modelado 3D definitivo. Conviene tener en cuenta que los términos del creador no permiten vender las imágenes generadas.
- Pruebas comparativas del modelo base: usar el adaptador como sonda de identidad para evaluar cómo distintos samplers, schedulers o niveles de CFG afectan a la fidelidad del personaje en Krea 2 y Krea 2 Turbo.
- Investigación sobre LoRA de identidad: analizar el efecto de la fuerza del adaptador y de la época de entrenamiento en la deriva de identidad, dado que se publican los metadatos de entrenamiento y el hash del archivo (reproducibilidad del artefacto, no del dataset).
- Generación en la plataforma Civitai: el creador permite explícitamente la generación en el sitio de Civitai, lo que ofrece una vía de uso sin despliegue local, sujeta igualmente a la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas cuantitativas de fidelidad de identidad (similitud facial, CLIP-I, DINO), FID, ni evaluaciones de calidad subjetiva más allá de la galería de muestras del creador, que no constituye una evaluación reproducible.

## Requisitos de hardware

- El adaptador ocupa 114.324.752 bytes (~109 MiB) en disco y un peso equivalente al cargarse en fp16; el coste real de VRAM lo determina íntegramente el modelo base Krea 2.
- VRAM estimada para inferencia: no disponible, al no publicarse las especificaciones de Krea 2 en la información proporcionada.
- GPU recomendadas: no disponible por el mismo motivo; el adaptador en sí no impone requisitos adicionales significativos frente al base.
- Compatibilidad con GPU de consumo: no confirmable sin datos del modelo base. El adaptador no es el factor limitante.
- Opciones de despliegue: ComfyUI (copiar el `.safetensors` en `models/loras/` y refrescar la lista de modelos) y carga programática mediante `diffusers` con PEFT. vLLM, llama.cpp, Ollama y TGI no aplican: son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del modelo base, del sampler, del número de pasos y del hardware. La variante Krea 2 Turbo podría reducir el número de pasos necesarios, pero no hay cifras publicadas.
- Almacenamiento: el repositorio completo son 0,1 GB, muy por debajo del espacio requerido por el modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño / formato | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2-Cam-v1 | LoRA de personaje | 114 MB, safetensors fp16 | Krea 2 / Krea 2 Turbo | Krea 2 Community License + términos del creador | Hugging Face, Civitai, GitHub Releases, Ko-fi |
| Jessica (TigerFan69) | LoRA de personaje | No disponible | Krea 2 | No disponible en la información consultada | Ko-fi, GitHub |
| Erika (TigerFan69) | LoRA de personaje | No disponible | Krea 2 | No disponible en la información consultada | GitHub |
| Adaptadores de identidad para otros modelos abiertos (SDXL, FLUX) | LoRA de personaje | Variable según adaptador | SDXL / FLUX | Variable (a menudo Apache 2.0 o licencias comunitarias) | Ecosistemas Civitai y Hugging Face |

No existen métricas públicas que permitan comparar la fidelidad de identidad de Cam v1 con las otras LoRA de personaje del mismo autor ni con adaptadores equivalentes de otros modelos base, por lo que la comparación se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: el creador no permite compartir merges, vender las imágenes generadas, usar el adaptador en otros servicios de generación ni vender el adaptador o sus merges. La generación en el sitio de Civitai sí está permitida. El acceso gratuito no elimina estas restricciones y no se aplica ninguna licencia MIT a los pesos.
- Doble licencia: además de los términos del creador, se aplica la Krea 2 Community License Agreement y su Acceptable Use Policy; es necesario leer `LICENSE.pdf`, `NOTICE.txt` y `CREATOR-TERMS.md` antes de descargar o usar el artefacto.
- Dependencia del modelo base: el repositorio no incluye Krea 2, que debe obtenerse por separado y bajo sus propias condiciones; sin él, el archivo no es funcional.
- Idioma: solo se documenta inglés. No hay evidencia de que los prompts en castellano produzcan resultados equivalentes.
- Ausencia de evaluación: no hay métricas de fidelidad de identidad, ni valores de fuerza del LoRA probados de forma independiente. El creador advierte explícitamente que no existe un valor de strength universal y que los resultados varían con el base y el workflow.
- La imagen de previsualización es una muestra del creador y no garantiza una salida idéntica; el preview distribuido tiene los metadatos de prompt y workflow eliminados.
- Dataset no documentado: no se publica composición, número de imágenes ni proceso de captioned. La relación de 2.000 pasos con 68 épocas sugiere un dataset pequeño, con el riesgo de sobreajuste asociado (pérdida de variedad de pose y expresión).
- Sesgos: no se han documentado sesgos específicos del adaptador; el modelo base puede heredar los de su propio dataset de entrenamiento, no disponible.
- Alucinación en el sentido de artefactos: en modelos de difusión se manifiesta como deriva de identidad, anatomía incorrecta o manos deformadas. No hay evaluación publicada de la frecuencia de estos fallos.
- Contenido: el personaje es un personaje adulto ficticio; el paquete no contiene imágenes explícitas, pero el uso está sujeto a la política de uso aceptable del modelo base.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, lo que impide contrastar la calidad con reportes de terceros.
- El autor no es Krea ni está respaldado por Krea; se trata de un derivado independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigerFan69/Krea-2-Cam-v1
- Publicación original en Civitai: https://civitai.red/models/3019050
- Release en GitHub: https://github.com/TigerFan69/krea-character-loras/releases/tag/cam-v1
- Repositorio GitHub con otras LoRA de personaje: https://github.com/TigerFan69/krea-character-loras/tree/main
- Descarga gratuita en Ko-fi: https://ko-fi.com/s/4ba9f62a6b
- Página de suscripción opcional del autor: https://ko-fi.com/tigerfan69/tiers
- Licencia (PDF): https://huggingface.co/TigerFan69/Krea-2-Cam-v1/blob/main/LICENSE.pdf
- Aviso legal: https://huggingface.co/TigerFan69/Krea-2-Cam-v1/blob/main/NOTICE.txt
- Términos del creador: https://huggingface.co/TigerFan69/Krea-2-Cam-v1/blob/main/CREATOR-TERMS.md
- Ficha de referencia del modelo base Krea 2: https://www.modelscope.cn/models/vantagewithai/krea-2/summary
