# wendellperbar/serigy-sapiens-vso

## Resumen
Serigy Sapiens VSO es un modelo de clasificacion de imagenes medicas (radiografias de torax) publicado en Hugging Face por el usuario wendellperbar (Wendell Barreto). Se presenta como un clasificador especializado en radiologia con calibracion de confianza y prediccion selectiva ("typed decisions"), construido como un fine-tuning del modelo multimodal google/medsiglip-448, un encoder visual-entexto de SigLIP adaptado al dominio medico. El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato safetensors.

El modelo esta etiquetado con el prefijo "serigy", que corresponde a una libreria Python homonima (publicada en PyPI) descrita como un clasificador local de fake news en portugues de Brasil que expone primitivos de "System One" (Escolha, Indice, Verdadeiro, Prioridade). Esta conexion sugiere que el autor reutiliza esa infraestructura conceptual para estructurar decisiones tipadas sobre la salida del clasificador radiologico, aunque la documentacion disponible no detalla el mecanismo exacto de esa capa.

La relevancia practica del modelo esta condicionada por varios factores: es un artefacto muy reciente (creado el 4 de noviembre de 2026 y actualizado el 7 de noviembre de 2026), sin descargas ni likes registrados, con acceso restringido (gated) y una licencia de tipo "health-ai-developer-foundations" que impone condiciones adicionales de uso. No se dispone de informacion publica sobre volumen de entrenamiento, composicion del dataset ni resultados de evaluacion, lo que limita seriamente cualquier valoracion de su calidad clinica o tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder vision-lenguaje derivado de google/medsiglip-448 (SigLIP adaptado a dominio medico), con fine-tuning para clasificacion de imagenes |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo de clasificacion de imagen, no generativo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | health-ai-developer-foundations (license:other) |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Libreria | serigy |
| Modelo base | google/medsiglip-448 |
| Tamano del repositorio | ~0,1 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en Hugging Face |

## Arquitectura y entrenamiento
El modelo parte de google/medsiglip-448, un encoder SigLIP entrenado con pares imagen-texto en el dominio medico. Sobre esa base, el autor aplica un fine-tuning para convertir el encoder en un clasificador de radiografias de torax, orientado a tareas de radiologia. La informacion disponible no especifica cuantas capas se han ajustado, si se ha congelado el encoder o si se ha anadido una cabeza de clasificacion dedicada.

Las etiquetas del repositorio indican tres ejes de diseno: calibracion de confianza ("confidence-calibration"), prediccion selectiva ("selective-prediction") y decisiones tipadas ("typed-decisions"), ademas de la mencion a "system-one". Esto apunta a un clasificador que no solo emite una etiqueta, sino que acompanha la prediccion con una medida de confianza y permite abstenerse o derivar el caso cuando la certeza es insuficiente. No se dispone de datos sobre numero de tokens, composicion del dataset de fine-tuning, uso de RLHF/DPO ni tecnicas de decodificacion especulativa, que en un clasificador de imagen no aplicarian del mismo modo.

## Capacidades
- Clasificacion de imagenes de radiografia de torax (chest-x-ray) en categorias diagnosticas, segun las etiquetas del repositorio.
- Salida con calibracion de confianza: el modelo esta disenado para acompanhar la prediccion con una estimacion de certeza.
- Prediccion selectiva: capacidad de abstenerse o marcar casos ambiguos en lugar de forzar una etiqueta.
- Decisiones tipadas ("typed-decisions") mediante la libreria serigy, que expone primitivos como Escolha, Indice, Verdadeiro y Prioridade.
- Integracion con el ecosistema Hugging Face mediante el pipeline image-classification.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision general, audio ni modo de razonamiento explicito.

## Casos de uso
- Triaje radiologico automatizado: clasificar radiografias de torax entrantes y usar la confianza calibrada para derivar los casos de baja certeza a revision por un radiologo, reduciendo la carga de lectura de estudios normales.
- Segunda lectura en entornos con escasez de especialistas: procesar lote de imagenes en centros sin radiology de guardia y priorizar los estudios con mayor probabilidad de hallazgo.
- Filtrado previo en pipelines de investigacion: clasificar grandes colecciones de radiografias para seleccionar subconjuntos por categoria antes de anotacion manual o analisis estadistico.
- Control de calidad de adquisicion: detectar imagenes con caracteristicas compatibles con artefactos o estudios no diagnosticos gracias a la prediccion selectiva, que permite rechazar casos dudosos.
- Integracion en sistemas de soporte a la decision clinica: consumir el modelo via el pipeline image-classification de Hugging Face y combinar la etiqueta con la confianza calibrada en reglas de negocio del hospital.
- Prototipado de investigacion en calibracion: utilizar el modelo como referencia para estudiar tecnicas de selective prediction y decisiones tipadas en clasificacion medica, aprovechando la libreria serigy.
- Despliegue local en entornos con requisitos de privacidad: al tratarse de un artefacto de ~0,1 GB en safetensors, puede cargarse en infraestructura propia sin enviar imagenes a servicios externos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. Dado el tamano del repositorio (~0,1 GB), el modelo es pequeno en comparacion con LLMs y deberia caber en GPUs de consumo, pero no se confirma en la informacion disponible.
- GPU recomendadas: no disponible. Por el origen (medsiglip-448, encoder de ~448 px) es plausible que funcione en GPUs consumer tipo RTX 3060/4090, pero esto no esta verificado en la fuente.
- Cabe en GPU consumer: probable, no confirmado.
- Opciones de despliegue: pipeline image-classification de Hugging Face con safetensors; libreria serigy. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wendellperbar/serigy-sapiens-vso | no disponible | no disponible | Clasificacion de radiografia de torax con calibracion | health-ai-developer-foundations | Gated en HF |
| google/medsiglip-448 | no disponible | no disponible | Encoder vision-lenguaje medico (zero-shot y fine-tuning) | no disponible en la informacion proporcionada | Publico en HF |
| Alternativas de clasificacion radiologica | no disponible | no disponible | Clasificacion de chest-x-ray | no disponible | no disponible |

No se dispone de informacion sobre otros clasificadores radiologicos concretos con los que comparar directamente en la fuente proporcionada; la unica referencia solida es el modelo base google/medsiglip-448.

## Limitaciones y advertencias
- Ausencia total de evaluacion publica: no hay benchmarks, metricas de AUC, sensibilidad ni especificidad, lo que impide valorar su utilidad clinica.
- Riesgo de alucinacion y falsos negativos: cualquier clasificador radiologico puede omitir hallazgos; la prediccion selectiva mitiga pero no elimina este riesgo.
- Sesgos desconocidos: no se documenta la composicion demografica del dataset de fine-tuning, por lo que pueden existir sesgos de poblacion, equipo de adquisicion o protocolo radiologico.
- Idioma: solo etiquetado para ingles; las etiquetas de clase y cualquier texto asociado no estan disponibles en castellano.
- Licencia restrictiva: "health-ai-developer-foundations" (license:other) impone condiciones especificas; es imprescindible revisar los terminos antes de cualquier uso comercial o clinico.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad y a la auditoria por terceros.
- Madurez: repositorio creado y actualizado en noviembre de 2026, con cero descargas y cero likes; no hay evidencia de uso en produccion ni de mantenimiento sostenido.
- Uso clinico: no debe emplearse como sustituto del diagnostico profesional; cualquier despliegue requeriria validacion regulatoria y supervision medica.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/wendellperbar/serigy-sapiens-vso
- Perfil del autor: https://huggingface.co/wendellperbar
- Libreria serigy en PyPI: https://pypi.org/project/serigy/
- Modelo base: https://huggingface.co/google/medsiglip-448
