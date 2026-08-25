# spyrostheboss/Charithra_Chandran_Krea_2_LoRA

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Krea 2 Raw, desarrollado por el usuario `spyrostheboss` en HuggingFace. Su propósito es reproducir de forma consistente la apariencia y los rasgos faciales de la actriz Charithra Chandran en generaciones de imágenes, manteniendo la identidad a través de diferentes poses, expresiones, atuendos, ángulos y composiciones. Se trata de un LoRA de personaje, una técnica habitual en modelos de difusión de texto a imagen para especializar un modelo genérico en un sujeto concreto sin necesidad de reentrenar el modelo completo.

El adaptador se ha entrenado sobre 310 imágenes del personaje, con una dimensión de red de 32 y un alpha de 32, y se distribuye como un único archivo `safetensors` de aproximadamente 0,5 GB (tamaño del repositorio completo, que incluye muestras). Está diseñado para usarse con el modelo base Krea 2, preferiblemente la variante Turbo para inferencia, y requiere la palabra de activación `chardran` como primer token del prompt. La relevancia de este tipo de modelos radica en que permiten a creadores y desarrolladores generar imágenes de un personaje específico con alta fidelidad y control, sin necesidad de entrenar un modelo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Krea-2/lora (adaptador LoRA sobre Krea 2 Raw) |
| Parametros totales | no disponible (dim 32, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (entrenado con base fp8, pero no se especifican cuantizaciones de inferencia) |
| Idiomas soportados | no disponible (el text encoder Qwen3-VL-4B soporta multiples idiomas, pero no se documenta) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (un unico archivo) |

## Arquitectura y entrenamiento

El modelo es un LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base Krea 2 Raw, un modelo de difusion de texto a imagen de la familia Krea 2. La arquitectura del adaptador sigue el esquema `networks.lora_krea2`, con una dimension de red de 32 y un alpha de 32. Durante el entrenamiento, el text encoder (Qwen3-VL-4B) y el VAE (Qwen-Image VAE) se mantienen congelados, y solo se actualizan los pesos del adaptador. El entrenamiento se realizo con 310 imagenes, 5 epocas (390 pasos), batch size efectivo de 4 (1 con gradiente acumulado de 4), optimizador AdamW8bit, learning rate constante de 1e-4, y resolucion de 1024x1024 con bucketing. Se utilizo mixed precision bf16 con base fp8, y un esquema de muestreo de timesteps `krea2_shift`. No se mencionan tecnicas de RLHF ni DPO; el entrenamiento es puramente supervisado sobre el dataset de imagenes del personaje.

## Capacidades

- Generacion de imagenes fotorrealistas de Charithra Chandran con consistencia de identidad facial, incluyendo pecas, color de ojos y cabello.
- Control de poses, expresiones, atuendos, angulos y composiciones mediante el prompt de texto.
- Requiere la palabra de activacion `chardran` como primer token del prompt para activar el adaptador.
- Compatible con el modelo base Krea 2 Turbo para inferencia rapida (8 pasos, CFG desactivado).
- No incluye capacidades de texto, codigo, vision o audio; es exclusivamente un adaptador de generacion de imagenes.

## Casos de uso

- Creacion de retratos personalizados: el LoRA permite generar retratos de la actriz en diferentes estilos y entornos, util para fan art o proyectos personales.
- Ilustracion de personajes en narrativa visual: escritores o creadores de novelas visuales pueden usar el modelo para ilustrar escenas con un personaje consistente.
- Generacion de avatares y perfiles: se pueden crear imagenes de perfil o avatares con la apariencia de la actriz para redes sociales o foros.
- Pruebas de vestuario y maquillaje: disenadores pueden generar imagenes del personaje con diferentes atuendos o estilos de maquillaje para visualizar conceptos.
- Produccion de contenido para marketing: si la licencia lo permite, se podrian generar imagenes promocionales con la imagen de la actriz para campañas ficticias o demos.
- Desarrollo de personajes para videojuegos: el adaptador puede servir para generar concept art de un personaje basado en la actriz, manteniendo coherencia visual en multiples ilustraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de evaluacion cuantitativa (como FID, CLIP score, o comparaciones con otros LoRA) en la model card ni en la busqueda web.

## Requisitos de hardware

- El adaptador LoRA en si es ligero (un archivo safetensors), pero la inferencia requiere cargar el modelo base Krea 2, cuyo tamano no se especifica en la informacion disponible.
- Se recomienda una GPU con al menos 8-12 GB de VRAM para ejecutar Krea 2 a resolucion 1024x1024, aunque no se proporcionan datos exactos.
- El modelo se puede cargar en ComfyUI o mediante el script de inferencia musubi-tuner de Krea 2, segun indica la model card.
- No se especifican latencias ni throughput; dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRA de personaje especificos para Krea 2 en la busqueda web. Existen adaptadores similares para otros modelos de difusion (por ejemplo, para Stable Diffusion o Flux), pero no hay datos comparables en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- La licencia es "other" y no se especifican los terminos; no se puede confirmar si permite uso comercial o modificacion.
- El modelo esta entrenado exclusivamente para reproducir la apariencia de una persona real; su uso para suplantar o engañar podria tener implicaciones eticas y legales.
- Puede presentar inconsistencias en ciertos angulos o condiciones de iluminacion extremas, aunque el entrenamiento con 310 imagenes busca minimizarlas.
- Requiere el trigger exacto `chardran` en minusculas; si no se usa, el adaptador no se activa correctamente.
- No se han publicado evaluaciones de sesgos; como modelo de imagen, podria reflejar sesgos presentes en los datos de entrenamiento.
- La configuracion recomendada (Krea 2 Turbo, 8 pasos, CFG off) es necesaria para obtener resultados optimos; desviarse de ella puede degradar la calidad.

## Enlaces

- HuggingFace: https://huggingface.co/spyrostheboss/Charithra_Chandran_Krea_2_LoRA
- Repositorio de entrenamiento de LoRA para Krea 2 (relacionado): https://github.com/bongobongo2020/krea2-character-lora-trainer
- Biblioteca de modelos de Krea: https://www.krea.ai/models
- Archivo de modelos de CivitAI (no especifico): https://civitaiarchive.com/
