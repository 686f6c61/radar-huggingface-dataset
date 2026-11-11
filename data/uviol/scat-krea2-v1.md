# uviol/scat-krea2-v1

## Resumen

Scat LoRA — Krea 2 (identificador `uviol/scat-krea2-v1`) es un adaptador LoRA de texto a imagen publicado por el usuario uviol sobre el modelo base Krea-2. El adaptador está entrenado para generar imagenes fotorrealistas que representen la accion de defecar, con el verbo "shitting" como prompt de instancia preferido por el autor. Se distribuye en formato `safetensors` compatible con la libreria `diffusers` y ocupa aproximadamente 0,5 GB en el repositorio.

El modelo se construye sobre Krea-2-Raw (con referencias tambien a Krea-2-Turbo) y emplea un rango de 16 dimensiones en el adaptador, entrenado con `musubi-tuner` durante 120 epocas y 12 240 pasos. La model card indica que solo se ha entrenado con fotografias, por lo que para estilos no fotorrealistas probablemente sean necesarios LoRAs de estilo adicionales. Una actualizacion del 11 de noviembre de 2026 anade una version reentrenada sobre el modelo Kroma (`kroma-sensei-booru-e6-teacher-velocity-v0.3`).

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho con contenido para adultos (etiqueta `not-for-all-adultes`), con una licencia personalizada y sin datos publicos de benchmarks, idiomas o evaluacion cuantitativa. Su interes tecnico reside en documentar el flujo de entrenamiento de un LoRA sobre Krea-2 con `musubi-tuner` y en las advertencias de uso que implica su tematica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea-2 |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base no se especifica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `other`, con nombre `scat-flux-2-klein-9b-v1` y enlace a LICENSE.pdf del repositorio krea/Krea-2-LoRA-impressionist |
| Formato de pesos | `safetensors` (`scat-krea2-v1.safetensors`, `scat-kroma-v1.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 (dim/rank 16) aplicado sobre el modelo de difusion Krea-2-Raw. El entrenamiento se realizo con `musubi-tuner`, usando el optimizador AdamW8Bit con valores por defecto, una planificacion de tasa de aprendizaje `cosine_with_min_lr` con LR de 2e-4 y ratio minimo de 0,1, 300 pasos de calentamiento y muestreo de timesteps `krea2_shift`. El entrenamiento total fue de 120 epocas, equivalentes a 12 240 pasos.

El conjunto de datos es el mismo que el de la version Klein-9B, segun la model card, y esta compuesto unicamente por fotografias. No se detalla el numero de imagenes ni la composicion del dataset. La version publicada el 11 de noviembre de 2026 se reentreno sobre el modelo Kroma (`kroma-sensei-booru-e6-teacher-velocity-v0.3`), que segun el autor podria ofrecer un rendimiento ligeramente mejor que la version base de Krea, aunque esta ultima ya funcionaba correctamente sobre Kroma.

## Capacidades

- Generacion de imagenes fotorrealistas de texto a imagen mediante el modelo base Krea-2.
- Especializacion en una tematica concreta (accion de defecar) mediante prompt de instancia ("shitting", "defecating", "shit", "feces").
- Compatible con la libreria `diffusers` y con el ecosistema de adaptadores LoRA.
- Posibilidad de combinarse con LoRAs de estilo para resultados no fotorrealistas, segun indica el autor.
- Soporte de dos variantes: una para Krea-2 y otra para Kroma.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues.

## Casos de uso

- Generacion de imagenes de referencia para ilustracion medica o divulgativa: el adaptador puede producir imagenes fotorrealistas de la accion de defecar para material educativo, siempre que se respete la licencia y las politicas de contenido del despliegue.
- Investigacion sobre sesgos y contenido sensible en modelos de difusion: permite estudiar como un LoRA de nicho modifica la distribucion de salida del modelo base y que salvaguardas son necesarias.
- Pruebas de seguridad y filtrado de contenido: util para validar clasificadores y filtros de contenido para adultos en pipelines de generacion de imagenes.
- Evaluacion de tecnicas de entrenamiento LoRA: sirve como caso de estudio reproducible de un LoRA de rango 16 entrenado con `musubi-tuner` y planificacion coseno.
- Creacion de contenido artistico para adultos en entornos controlados: el adaptador permite generar escenas fotorrealistas dentro de una plataforma con verificacion de edad y cumplimiento normativo.
- Comparativa de modelos base Krea-2 frente a Kroma: al existir dos variantes del adaptador, permite evaluar diferencias cualitativas entre ambos modelos base con el mismo dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Krea-2, cuyas especificaciones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `diffusers` (libreria declarada en el repositorio); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican a un modelo de difusion de imagen.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uviol/scat-krea2-v1 | LoRA sobre Krea-2 | rango 16 (adaptador) | no aplica | `other` (scat-flux-2-klein-9b-v1) | Hugging Face, 1316 descargas |
| Version Klein-9B del mismo autor | LoRA sobre Klein-9B | no disponible | no aplica | no disponible | referenciada en la model card, sin enlace directo |
| krea/Krea-2-LoRA-impressionist | LoRA sobre Krea-2 | no disponible | no aplica | referenciada en el enlace de licencia | Hugging Face |
| krea/Krea-2-Raw | modelo base de difusion | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio lleva la etiqueta `not-for-all-audiences` y la tematica es explicita; no es apto para menores ni para entornos sin control de edad.
- Solo entrenado con fotografias: para estilos no fotorrealistas el autor recomienda combinar con LoRAs de estilo, lo que anade complejidad al pipeline.
- Licencia personalizada: la licencia `other` con nombre `scat-flux-2-klein-9b-v1` remite a un PDF externo; es imprescindible revisar sus terminos antes de cualquier uso comercial, que puede estar restringido o prohibido.
- Riesgo de alucinacion y artefactos: como todo modelo de difusion, puede generar anatomia incoherente, artefactos visuales y resultados no deseados, especialmente en composiciones complejas.
- Sin datos de evaluacion: no hay benchmarks, metricas de calidad ni evaluacion de sesgos publicados.
- Idiomas no documentados: se desconoce el soporte multilingue de los prompts.
- Dependencia del modelo base: el rendimiento y los requisitos de hardware vienen determinados por Krea-2 o Kroma, cuyas especificaciones no se detallan en la informacion disponible.
- Posibles restricciones de plataforma: muchos servicios de alojamiento de modelos y APIs prohiben contenido sexual explicito o escatologico, lo que limita su despliegue en infraestructuras comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uviol/scat-krea2-v1
- Descarga Krea2: https://huggingface.co/uviol/scat-krea2-v1/resolve/main/scat-krea2-v1.safetensors
- Descarga Kroma: https://huggingface.co/uviol/scat-krea2-v1/resolve/main/scat-kroma-v1.safetensors
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Modelo Kroma: https://huggingface.co/lodestones/Kroma
- Licencia (PDF): https://huggingface.co/krea/Krea-2-LoRA-impressionist/blob/main/LICENSE.pdf
- LoRA de referencia Krea-2-LoRA-impressionist: https://huggingface.co/krea/Krea-2-LoRA-impressionist
