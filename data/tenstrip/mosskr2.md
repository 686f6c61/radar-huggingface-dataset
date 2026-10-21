# TenStrip/MOSSkr2

## Resumen

MOSSkr2 es un checkpoint de difusión de imagen en un único fichero publicado por el usuario TenStrip en Hugging Face, derivado del modelo OpenMOSS-Team/MOSS-Image-SFT. No se trata de un modelo entrenado desde cero ni de un fine-tune convencional: es un "injerto" (graft) de pesos en el que se trasplantan las proyecciones Q y K de la atención y las proyecciones gate/up del MLP de otro modelo, Krea 2, sobre la arquitectura de MOSS-Image SFT. Según el autor, no se añaden datos ni se ejecuta entrenamiento alguno; solo se modifica el comportamiento de la atención para que MOSS "tokenice" de forma ligeramente similar a Krea 2.

El resultado declarado es un aumento de detalle, mejores composiciones de fondo, mayor contraste y saturación, y una mejora general en prompts poco refinados donde el modelo base rendía peor. El autor lo describe como un efecto equivalente a un LoRA de detalle más un LoRA de ajuste de niveles, sin interferir con prompts ni semillas concretas. También señala que el injerto es no destructivo y que mantiene compatibilidad con los primeros DMD turbo, lo que permite usarlo a fuerza reducida (0,7-0,8) con 8-12 pasos.

Su relevancia ahora es doble: por un lado, demuestra una técnica de modificación de modelos de difusión sin entrenamiento que está generando variantes en el ecosistema (existe ya una versión en LoRA/patch de otro autor); por otro, su adopción es todavía muy limitada (342 descargas y 12 likes en el momento de la consulta) y no cuenta con evaluación cuantitativa publicada, por lo que debe tratarse como un artefacto experimental de la comunidad más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de imagen en un unico fichero; la model card no detalla el backbone. El injerto actua sobre las proyecciones Q y K de la atencion y sobre gate/up del MLP, lo que implica un backbone transformer con bloques de atencion y MLP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica: modelo de difusion de imagen sin ventana de contexto textual; la longitud maxima de prompt no esta documentada |
| Tipos de cuantizacion | no disponible. El autor compara el resultado con el "int8 sft" del modelo base, y existe una variante LoRA/patch que carga sobre ficheros MOSS-Image SFT, incluidos los int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | single-file (libreria diffusion-single-file); tambien disponible como LoRA y ficheros patch en WAS/Krea2_MOSS_graft_lora |
| Tamano del checkpoint | 10,2 GB segun la model card de la variante LoRA; el repositorio ocupa 15,8 GB en total |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Descargas / likes | 342 / 12 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de MOSS-Image SFT ni el numero de parametros o de bloques. Lo que sí detalla es la operación realizada: se extraen de Krea 2 los pesos de las proyecciones Q y K de la atención y de las proyecciones gate y up del MLP, y se injertan en el checkpoint de MOSS-Image SFT. El autor insiste en que no se añaden datos ni pesos nuevos, que no se ha entrenado nada y que el modelo resultante no imita el estilo de Krea 2: solo modifica cómo MOSS atiende a los tokens, de forma que su tokenización se aproxima ligeramente a la de Krea 2.

El mecanismo es, por tanto, una transferencia de pesos entre modelos con capas funcionalmente equivalentes, no un fine-tune, un DPO ni un RLHF. No hay información sobre el dataset de entrenamiento del modelo base, el número de tokens vistos ni el proceso de alineación. El autor menciona además un ajuste deliberado de la "v band" (interpretable como la banda de baja frecuencia en el dominio latente o espectral, aunque no lo especifica): la reduce y la fusiona a menor intensidad, pero conserva parte del aumento de contraste y saturación porque consideraba que el MOSS base era excesivamente plano y desaturado. La innovación técnica destacable es precisamente la metodología: modificación de comportamiento mediante injerto de submatrices de atención y MLP, sin coste de entrenamiento y descrita como no destructiva.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), con prompts y semillas estables según el autor: el injerto no altera la respuesta a un prompt o semilla concretos.
- Mayor nivel de detalle en la imagen generada respecto al MOSS-Image SFT base, especialmente en escenarios poco refinados.
- Mejora declarada en composición de fondos y en la estructura global de la escena, que el autor identifica como la diferencia más significativa junto con el detalle de personajes.
- Aumento de contraste y saturación, útil para ilustración, arte y estética anime.
- Compatibilidad con los primeros DMD turbo, lo que permite inferencia en 8-12 pasos con fuerza de 0,7-0,8.
- Compatibilidad con flujos de trabajo basados en checkpoints single-file y con la aplicación del injerto como LoRA/patch sobre checkpoints int8.
- No dispone de tool calling, capacidad de agente, razonamiento multi-paso ni modalidades de audio o vídeo: es un modelo de difusión de imagen.
- Capacidades multilingües en los prompts: no documentadas.

## Casos de uso

- Ilustración y arte estilo anime: el autor reporta generaciones "más nítidas y coloridas" que el base, lo que encaja en pipelines de creación de ilustración donde se busca saturación y detalle por defecto sin añadir LoRAs de estilo.
- Composición de fondos y key art: la mejora declarada en composiciones de fondo lo hace adecuado para generar escenarios completos (paisajes, interiores, establecimientos) donde el modelo base tendía a composiciones planas.
- Sustituto de bajo coste de un LoRA de detalle: al comportarse de forma similar a un "detailer LoRA" más un ajuste de niveles, puede sustituir a dos LoRAs apilados en un workflow, simplificando la cadena y evitando conflictos entre adaptadores.
- Iteración rápida con DMD turbo: combinado con los primeros DMD turbo a fuerza 0,7-0,8 y 8-12 pasos, permite exploraciones de concepto con latencia baja antes de un render final de más pasos.
- Flujos con memoria limitada: al existir una variante LoRA/patch que se carga sobre checkpoints MOSS-Image int8, se puede aplicar el efecto sin cargar el checkpoint completo de 10,2 GB, útil en GPUs de 12-16 GB.
- Exploración artística por lotes en estudios pequeños: generación por lotes de assets (fondos, personajes, elementos decorativos) con una estética más contrastada que el base, usando el checkpoint single-file en la librería diffusion-single-file.
- Investigación sobre merging e injerto de pesos: sirve como caso de estudio reproducible de transferencia de submatrices de atención entre modelos de difusión sin entrenamiento, con una variante LoRA que facilita el análisis diferencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas valoraciones existentes son cualitativas y provienen del propio autor (más detalle, mejores fondos, mayor contraste, mejora en prompts poco refinados frente al int8 SFT). No hay FID, CLIP score, evaluación de adherencia al prompt ni comparaciones numéricas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 10,2 GB, de modo que en bf16/fp16 necesita del orden de 12-16 GB de VRAM para pesos más activaciones a resolución estándar de difusión (estimación propia a partir del tamano del fichero, no confirmada por el autor).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano de checkpoint, encajan GPU de 16 GB o más (RTX 4080, RTX 4090, A100 40 GB, H100); con 24 GB se dispone de margen para resolución alta y apilado de LoRAs.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y RTX 4080 (16 GB) con el checkpoint completo; en GPUs de 12 GB seria necesario recurrir a la variante LoRA/patch sobre un checkpoint int8, que evita cargar los 10,2 GB completos.
- Opciones de despliegue: la libreria diffusion-single-file es el canal declarado (tag de la model card). El ecosistema de la variante LoRA/patch y de checkpoints single-file apunta a entornos tipo ComfyUI, aunque la compatibilidad concreta no esta confirmada en la informacion disponible. No hay soporte documentado para vLLM o TGI, que no aplican a difusion de imagen.
- Latencia y throughput: no disponibles. El unico dato indirecto es la recomendacion de 8-12 pasos con DMD turbo a fuerza 0,7-0,8, que reduce el coste por imagen frente a un muestreo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TenStrip/MOSSkr2 | no disponible | no disponible | Sin benchmarks; mejoras cualitativas declaradas por el autor sobre el base | Apache 2.0 | Checkpoint single-file de 10,2 GB (repo de 15,8 GB), 342 descargas |
| OpenMOSS-Team/MOSS-Image-SFT (base) | no disponible | no disponible | Referencia del autor: mas plano y desaturado, peor en prompts poco refinados | no disponible en la informacion proporcionada | Disponible en Hugging Face; existe version int8 |
| WAS/Krea2_MOSS_graft_lora (variante) | no aplica (LoRA/patch) | no aplica | Mismo injerto que MOSSkr2, en formato LoRA/patch | no disponible en la informacion proporcionada | Carga sobre cualquier MOSS-Image SFT, incluido int8, sin el checkpoint de 10,2 GB |
| Krea 2 | no disponible | no disponible | Solo se usa como fuente de submatrices Q/K y gate/up; no se compara su rendimiento | no disponible en la informacion proporcionada | No se distribuye en este repositorio |

## Limitaciones y advertencias

- Ausencia total de evaluación cuantitativa: las mejoras descritas (detalle, fondos, contraste) son afirmaciones del autor sin FID, CLIP score ni comparación ciega.
- Metodología no documentada en detalle: no se especifica qué capas exactas, en qué proporción ni con qué criterio de alineación se injertaron los pesos de Krea 2, lo que dificulta reproducir o auditar el resultado.
- La propia model card incluye lenguaje valorativo y despectivo hacia parte de la comunidad ("impossible if you ask educated elitist ML nerds"), lo que reduce la fiabilidad de las afirmaciones técnicas y conviene contrastar de forma independiente.
- Cambio forzado de contraste y saturación: el autor reconoce haber conservado ese efecto deliberadamente, lo que puede ser indeseable en pipelines que requieran fidelidad de color o reproducción realista de tonos de piel y materiales.
- Dependencia de la compatibilidad con DMD turbo: el rendimiento a fuerza reducida (0,7-0,8) y 8-12 pasos está indicado solo para "las primeras versiones" del turbo; con otras versiones o schedulers el comportamiento no está garantizado.
- Sin información sobre idiomas soportados en los prompts ni sobre sesgos demográficos o culturales del modelo base.
- Licencia Apache 2.0 declarada en este repositorio, pero no se documenta la licencia del modelo base OpenMOSS-Team/MOSS-Image-SFT ni la de Krea 2, cuyo origen de pesos podría imponer restricciones adicionales para uso comercial. Verificar antes de desplegar en producción.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía, texto en imagen y objetos incoherentes; sin benchmarks no hay medida de la frecuencia.
- Advertencia de procedencia: el injerto se distribuye "as is", sin garantías, y el autor indica explícitamente que no se entrenó nada; no debe asumirse que el checkpoint es equivalente a un fine-tune validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TenStrip/MOSSkr2
- Perfil del autor: https://huggingface.co/TenStrip
- Actividad del autor: https://huggingface.co/TenStrip/activity/all
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Variante LoRA/patch del injerto: https://huggingface.co/WAS/Krea2_MOSS_graft_lora
- Listado de modelos de la libreria diffusion-single-file: https://huggingface.co/models?library=diffusion-single-file
