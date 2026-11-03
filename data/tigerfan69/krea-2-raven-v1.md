# TigerFan69/Krea-2-Raven-v1

## Resumen

Krea 2 Raven v1.0 es un adaptador LoRA de tipo personaje para el modelo base de generación de imágenes Krea 2 (identificado en el repositorio como `krea/Krea-2-Raw`). Lo publica el usuario TigerFan69 en HuggingFace bajo el identificador `TigerFan69/Krea-2-Raven-v1`, con espejo en Civitai (modelo 3032607, versión 3445425). No es un modelo fundacional: es un conjunto de pesos de adaptación que se carga sobre el modelo base y su text encoder/VAE correspondientes, que el usuario debe obtener por separado. El paquete contiene únicamente los pesos del LoRA y documentación neutra; no incluye imágenes de entrenamiento ni previsualizaciones generadas.

El adaptador está pensado para generar retratos y escenas de un personaje ficticio original llamado Raven, descrito por el autor como personaje adulto ficticio. El trigger declarado por el creador es `Raven-NotaRealPerson`. La metadata del archivo safetensors indica 1.500 pasos de entrenamiento y época 49 sobre Krea 2, con 512 tensores en fp32 y un tamaño de 457.111.520 bytes (aproximadamente 0,43 GB), coherente con el tamaño del repositorio de 0,5 GB.

La relevancia de esta ficha es acotada: se trata de un LoRA de personaje de nicho, sin descargas ni valoraciones en el momento de la consulta, publicado bajo la licencia comunitaria de Krea 2. Su interés práctico reside en ejemplificar el flujo de adaptación de personajes sobre Krea 2 en ComfyUI y en las restricciones de licencia que arrastra cualquier derivado de ese modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2; arquitectura del base no disponible en la informacion proporcionada |
| Parametros totales | No disponible; el archivo contiene 512 tensores en fp32 y 457.111.520 bytes |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo text-to-image, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | Pesos del adaptador en fp32 segun metadata; opciones de cuantizacion del modelo base no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Krea 2 Community License (license_name: krea-2-community-license) |
| Formato de pesos | safetensors (`krea2_raven-notarealperson_08f6dbab3b55.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de adaptación de bajo rango que se inyectan en las capas del modelo base Krea 2 para especializarlo en un concepto concreto: en este caso, la identidad visual del personaje Raven. La metadata del safetensors identifica el base como Krea 2 y registra 1.500 pasos de entrenamiento hasta la época 49, con 512 tensores almacenados en fp32. No se especifica en la información disponible el rango del LoRA, las capas objetivo, la resolución de entrenamiento, el tamaño del dataset ni la composición de las imágenes usadas.

No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un adaptador de personaje para difusión. Tampoco se describen innovaciones técnicas propias del adaptador. El autor indica explícitamente que no se realizó una generación nueva ni un benchmark de calidad para esta sincronización, y que no se reclama un rango de fuerza (strength) universalmente probado. El SHA-256 declarado del archivo es `ea47223faeb2604529f1ff07b158138efcef8cd428948bf3ac8d1cb1e743a603`, y según el autor los bytes originales coincidían con el SHA-256 publicado en Civitai antes del empaquetado, sin alteración de pesos.

## Capacidades

- Generación de imágenes de retrato y escena del personaje Raven sobre el modelo base Krea 2, mediante el trigger `Raven-NotaRealPerson`.
- Condicionamiento por prompt de texto en inglés para controlar pose, vestuario, iluminación y fondo del personaje.
- Ajuste de intensidad del efecto mediante el strength del LoRA en el cargador correspondiente (sin rango recomendado por el autor).
- Compatibilidad con flujos de trabajo de ComfyUI que usen un cargador de LoRA para Krea 2.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador de generación de imágenes, no un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni capacidades de agente.
- Capacidad multilingüe limitada al inglés según la metadata del repositorio.

## Casos de uso

- Creación de personajes consistentes para cómic o novela gráfica: el LoRA permite mantener la identidad de Raven a lo largo de varias ilustraciones usando el mismo trigger y semillas fijas, comparando strengths intermedios para preservar rasgos faciales y anatomía.
- Previsualización de vestuario y escenas en producción audiovisual: se generan variantes de un mismo personaje en distintos entornos y atuendos para explorar dirección de arte antes de encargar ilustración final.
- Prototipado de assets para videojuegos narrativos: retratos de diálogo y bustos del personaje para maquetas de interfaz, sustituibles después por arte definitivo.
- Ilustración de ficción serializada en plataformas de suscripción: generación de portadas y escenas episódicas con un personaje estable, siempre que la licencia comunitaria de Krea 2 lo permita para el uso comercial concreto.
- Pruebas de flujo de trabajo en ComfyUI: el adaptador sirve como caso de validación de un pipeline de Krea 2 con cargador de LoRA, comprobando que el modelo base, el text encoder y el VAE están correctamente instalados antes de escalar a otros personajes.
- Experimentación académica sobre personalización de modelos de difusión: permite estudiar cómo varía la fidelidad de identidad con el strength del LoRA y la semilla, usando prompts y semillas fijos como protocolo de comparación.
- Generación de material de rol o narrativa interactiva: retratos del personaje para fichas de partida y material de campaña, con la advertencia de revisar la licencia antes de distribuirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se realizó una generación nueva ni un benchmark de calidad para esta sincronización, y no se proporcionan métricas de FID, CLIP score, similitud de identidad ni comparativas cuantitativas con otros LoRA de personaje.

## Requisitos de hardware

- VRAM estimada para el adaptador: aproximadamente 0,43 GB en fp32 solo para los pesos del LoRA; el consumo real lo determina el modelo base Krea 2, cuyo tamaño y requisitos no se detallan en la información disponible.
- GPU recomendadas: no disponibles para el modelo base; para el adaptador en sí no se requiere hardware específico más allá del que exija Krea 2.
- Compatibilidad con GPU de consumo: no se puede confirmar sin los requisitos del modelo base; el adaptador por sí solo no impone una barrera adicional significativa.
- Opciones de despliegue: ComfyUI con un cargador de LoRA compatible con Krea 2, colocando el archivo en `ComfyUI/models/loras/`. El autor advierte explícitamente de no sustituir un flujo de FLUX.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea 2 Raven v1.0 (TigerFan69) | LoRA de personaje | krea/Krea-2-Raw | 512 tensores, 457.111.520 bytes, fp32 | No aplica | Krea 2 Community License | HuggingFace y Civitai; 0 descargas, 0 likes en el momento de la consulta |
| LoRA de personaje generico para Krea 2 | LoRA de personaje | Krea 2 | No disponible | No aplica | Krea 2 Community License | No disponible |
| Adaptadores de personaje para otros modelos de difusion (por ejemplo, familia FLUX.1) | LoRA de personaje | FLUX.1 | No disponible | No aplica | Licencias propias del base | No disponible |

No se dispone de datos de rendimiento ni de comparativas cuantitativas con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar por separado el modelo base Krea 2 y su text encoder y VAE bajo sus propios términos.
- El trigger debe ser exactamente `Raven-NotaRealPerson`; el autor advierte de que etiquetas de listado y nombres internos de ejecución pueden diferir, y de que el SHA-256 es el identificador fiable del archivo.
- No se ha realizado benchmark de calidad ni generación de validación para esta sincronización; el autor no reclama un rango de strength probado, por lo que la calidad a distintas intensidades es desconocida.
- Riesgo de artefactos en identidad, anatomía y fondos a strengths altos o bajos; se recomienda evaluar strengths intermedios con prompts y semillas fijos.
- Sesgos conocidos: no documentados en la información disponible; al ser un LoRA de personaje sobre un modelo base, hereda los sesgos de representación del base, no caracterizados aquí.
- Riesgo de alucinación visual: no aplica en el sentido de texto, pero sí existe riesgo de deriva de identidad y de generación de detalles inconsistentes del personaje.
- Limitación de idioma: prompts en inglés según la metadata del repositorio.
- Restricciones de licencia: la Krea 2 Community License no equivale a uso comercial irrestricto; el autor indica que la descarga gratuita no implica permiso para vender modelos o merges, y que la licencia MIT del software LoRA Studio no se aplica a estos pesos. Hay que leer LICENSE.pdf, NOTICE.txt y CREATOR-TERMS.md antes de usar.
- El personaje se declara ficticio y adulto; el autor prohíbe publicar fotos privadas, metadatos de flujo de trabajo o credenciales en informes de soporte.
- Cero descargas y cero valoraciones en el momento de la consulta: no hay evidencia de comunidad ni de validación por terceros.
- El repositorio no incluye imágenes de entrenamiento ni previsualizaciones, lo que dificulta evaluar la fidelidad del personaje antes de generar.

## Enlaces

- HuggingFace: https://huggingface.co/TigerFan69/Krea-2-Raven-v1
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Civitai (modelo): https://civitai.red/models/3032607?modelVersionId=3445425
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Perfil del autor en HuggingFace: https://huggingface.co/TigerFan69
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Apoyo al autor (Ko-fi): https://ko-fi.com/tigerfan69/tiers
- Software LoRA Studio: https://github.com/TigerFan69/lora-studio
