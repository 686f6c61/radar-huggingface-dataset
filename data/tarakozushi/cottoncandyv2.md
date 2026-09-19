# tarakozushi/CottonCandyv2

## Resumen

CottonCandyv2 es un checkpoint de generación de imágenes a partir de texto (text-to-image) publicado por el usuario tarakozushi en Hugging Face. Según la información del repositorio, se distribuye en formato safetensors y es compatible con la librería diffusers, con la etiqueta de arquitectura stable-diffusion. El propio autor lo describe como el resultado de "hornear" (bake-in) el fichero wai-kissmilk-07.safetensors dentro del modelo base WAI-REAL_CN (v14), dando lugar a un modelo de estilo ilustración/anime.

El repositorio no presenta descargas ni "likes" en el momento de la consulta, y su model card está redactada en japonés. La licencia declarada es all-rights-reserved y el texto legal prohíbe explícitamente la reproducción, modificación, redistribución y uso comercial por parte de terceros sin autorización expresa del autor, que indica que el material se publica únicamente con fines personales de estudio, investigación y verificación.

La relevancia de esta ficha es limitada: no hay documentación técnica de entrenamiento, no se publican benchmarks y la licencia restringe prácticamente cualquier uso en producción. Se trata, por tanto, de un artefacto de interés para experimentación personal con merges de checkpoints, no de un modelo apto para integración en productos o servicios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente para generación de imágenes (etiqueta stable-diffusion). Detalle de la arquitectura interna (UNet, text encoder, VAE) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de lenguaje natural) |
| Tipos de cuantizacion | no disponible (se distribuye un único fichero safetensors; no se documentan variantes GGUF, ONNX ni fp8) |
| Idiomas soportados | no disponible (el prompt de texto se asume en inglés por convención de la familia Stable Diffusion, sin confirmación del autor) |
| Licencia | all-rights-reserved (campo license: other, con licencia personalizada en el fichero LICENSE) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 6,9 GB |
| Modelo base | WAI-REAL_CN (v14) |
| Trigger word | kissmilk (el autor indica que su eficacia no está confirmada) |
| Fecha de creación | 2026-09-18 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna más allá de la etiqueta stable-diffusion y la librería diffusers. No se especifica si el checkpoint deriva de SD 1.5, SD 2.x o SDXL, ni el número de parámetros. El tamaño del repositorio (6,9 GB) corresponde a un único fichero safetensors de un checkpoint de difusión, pero ese dato por sí solo no permite determinar la familia concreta ni la precisión de almacenamiento.

Según la model card, el modelo se ha construido mediante un proceso de merge y bake-in: se ha integrado el fichero wai-kissmilk-07.safetensors dentro del modelo base WAI-REAL_CN (v14). El autor indica que solo disponía de la habilidad de mergeo SuperMerger de AM1111, que había migrado a Forge neo y que estaba probando las extensiones NeoMerger y SuperMergerNeo, por lo que los datos del proceso de horneado se perdieron. También señala que el horneado por capas (階層焼き) requiere una revisión más precisa. No se documentan tokens de entrenamiento, composición del dataset, ni uso de RLHF, DPO u otras técnicas de alineamiento, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image).
- Estilo orientado a ilustración y anime, según la etiqueta illustmix y el modelo base WAI-REAL_CN.
- Compatibilidad con el ecosistema diffusers y, por extensión, con interfaces que cargan checkpoints safetensors (AUTOMATIC1111, Forge, ComfyUI).
- Acepta la palabra clave "kissmilk" en el prompt, heredada del LoRA integrado, aunque el propio autor advierte de que su efecto no está verificado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües en el sentido de comprensión de texto; el prompt se procesa mediante el text encoder del modelo base.
- No dispone de modo "thinking", visión, audio ni entrada multimodal adicional.

## Casos de uso

Todos los casos siguientes quedan supeditados a la obtención de autorización expresa del autor, dado que la licencia prohíbe el uso por parte de terceros sin su permiso. Se enumeran a efectos descriptivos.

- Experimentación personal con merges de checkpoints: el modelo permite estudiar cómo afecta el bake-in de un LoRA (wai-kissmilk-07) sobre un base concreto (WAI-REAL_CN v14), comparando salidas antes y después de la integración.
- Generación de ilustración de estilo anime para uso privado: con una RTX consumer basta para producir imágenes de prueba, dado el tamaño del checkpoint.
- Estudio de la preservación de pesos en horneados por capas: el autor advierte de que el horneado por capas requiere revisión, por lo que este checkpoint sirve como caso de análisis de artefactos introducidos por el merge.
- Pruebas de reproducibilidad de merges: al haberse perdido el registro del proceso, el modelo es un ejemplo de por qué conviene versionar las recetas de merge (ratios, capas, herramientas).
- Evaluación cualitativa de la palabra clave "kissmilk": permite comprobar empíricamente si un trigger word de LoRA conserva efecto tras el bake-in.
- Docencia o divulgación sobre el ecosistema Stable Diffusion: ilustra las diferencias entre distribuir un LoRA y hornearlo en un checkpoint completo.
- Referencia negativa en auditorías de licencias: sirve como ejemplo de repositorio con licencia all-rights-reserved y model card en japonés que no debe incorporarse a pipelines comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros checkpoints. Los resultados de la búsqueda web no aportan datos técnicos: los enlaces recuperados corresponden a sitios de torrents y foros de electrónica sin relación con el modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamaño del repositorio (6,9 GB) y en las prácticas habituales de la familia Stable Diffusion; el autor no publica requisitos oficiales.

- VRAM estimada para inferencia: del orden de 6 a 10 GB en fp16 para el checkpoint completo, dependiendo de la resolución y del backend; con optimizaciones de atención eficiente y offloading puede reducirse por debajo de 6 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso en local; A100 o H100 solo tendrían sentido para servir varias instancias en paralelo.
- Cabe en GPU consumer: sí, previsiblemente en cualquier tarjeta con 8 GB o más de VRAM aplicando fp16 y atención optimizada; en tarjetas de 6 GB requeriría cuantización o carga por etapas.
- Opciones de despliegue: diffusers (librería declarada), AUTOMATIC1111 WebUI, Forge, ComfyUI. No se documenta soporte para vLLM, TGI ni llama.cpp, que no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles. No hay datos publicados de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento para establecer una comparativa cuantitativa. La tabla recoge únicamente los datos confirmados en la información proporcionada.

| Modelo | Relación | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|---|
| CottonCandyv2 | Modelo analizado | no disponible | no aplica | all-rights-reserved | safetensors | no disponible |
| WAI-REAL_CN (v14) | Modelo base del merge | no disponible | no aplica | no disponible | no disponible | no disponible |
| wai-kissmilk-07 | LoRA integrado en el bake-in | no disponible | no aplica | no disponible | no disponible | no disponible |

No se identifican en la búsqueda web alternativas comparables con datos públicos que permitan contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia all-rights-reserved: el texto legal prohíbe reproducir, modificar, redistribuir y usar comercialmente el modelo y sus derivados sin autorización expresa del autor. No es apto para producción ni para servicios de terceros.
- La model card está redactada en japonés y no incluye documentación técnica en inglés; esto dificulta la evaluación por parte de equipos que no lean ese idioma.
- El autor declara explícitamente que el repositorio se publica para uso personal y que no autoriza el uso por parte de terceros, aunque el material sea técnicamente accesible.
- No hay registro del proceso de merge: el propio autor indica que perdió los datos del horneado, lo que impide reproducir el resultado.
- El autor advierte de que el horneado por capas requiere una revisión más precisa, lo que sugiere posibles artefactos o pérdida de calidad frente al base.
- La eficacia del trigger word "kissmilk" no está confirmada por el autor.
- Riesgo de alucinación: en modelos de difusión se manifiesta como artefactos anatómicos, incoherencias en manos y objetos, y sesgos hacia estilos sobrerrepresentados en los datos de entrenamiento del modelo base.
- Sesgos conocidos: los checkpoints de estilo anime heredan sesgos de sus datasets de origen (representación de género, etnicidad y tipo de cuerpo), aunque no se documenta la composición del dataset en este repositorio.
- Idiomas: no hay información sobre el soporte real de prompts en idiomas distintos del inglés.
- Ausencia total de benchmarks publicados y de cero descargas o interacciones, lo que impide validar la calidad de forma independiente.
- Los resultados de la búsqueda web no contienen información útil sobre el modelo; los enlaces recuperados no están relacionados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tarakozushi/CottonCandyv2
- Fichero de licencia: https://huggingface.co/tarakozushi/CottonCandyv2/blob/main/LICENSE
- Modelo base declarado: WAI-REAL_CN (v14), sin enlace directo en la información proporcionada
- LoRA integrado: wai-kissmilk-07.safetensors, sin enlace directo en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo, su paper, repositorio de código o demos
