# zachttang/pi05-fold-cloth-50pct

## Resumen

pi05-fold-cloth-50pct es un checkpoint de ajuste fino completo del modelo de robotica pi0.5 (openpi) especializado en una unica tarea de manipulacion: doblar un mantel por la mitad a partir de la instruccion en lenguaje natural "Fold the tablecloth in half.". Lo publica el usuario zachttang en Hugging Face y esta pensado exclusivamente para inferencia y evaluacion en un stack OpenPI sobre JAX, no como un modelo Transformer al uso.

El checkpoint se entreno sobre un subconjunto del 50 % de los episodios de un dataset propio de 150 episodios (75 episodios seleccionados con semilla 42, 115.751 frames), mediante ajuste fino completo (no LoRA) desde los pesos base pi05_base. La configuracion emplea adaptacion de acciones conjuntas y pinza tipo ALOHA, con acciones delta y tres camaras de entrada (cam_high, cam_wrist_left, cam_wrist_right).

Su interes es acotado pero claro: sirve como referencia reproducible para quien quiera evaluar el efecto del volumen de datos en el ajuste fino de pi0.5 sobre una tarea de deformacion de tejidos, y como ejemplo de publicacion de checkpoints en formato Orbax para el ecosistema OpenPI. No hay resultados de evaluacion de politica publicados ni licencia especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (openpi), vision-lenguaje-accion; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en Orbax, sin variantes GGUF ni safetensors) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | no disponible (el autor no la ha especificado) |
| Formato de pesos | Orbax (directorios `params/` y `assets/`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `pi05_base` (`gs://openpi-assets/checkpoints/pi05_base/params`) y se ajusta con la configuracion personalizada de OpenPI `pi05_fold_cloth_real`. La politica recibe imagenes de tres camaras (`cam_high`, `cam_wrist_left`, `cam_wrist_right`) y una instruccion en lenguaje natural, y emite acciones delta de articulaciones y pinza adaptadas al esquema ALOHA. El entrenamiento se ejecuta en OpenPI sobre JAX y el resultado se serializa en formato Orbax. No se detalla en la informacion disponible la composicion interna del transformer, el numero de parametros ni la ventana de contexto.

El ajuste fino es completo, no LoRA. Se usaron 75 de los 150 episodios del dataset (muestreo con semilla 42), lo que da 115.751 frames seleccionados. La semilla de entrenamiento fue 42, el tamano de lote global 128, y el presupuesto de 15 epocas equivalio a 13.560 pasos; el checkpoint final corresponde al paso 13.559 (indexado desde cero). La ultima perdida de entrenamiento registrada fue 0,0013 en el paso 13.500, metrica de entrenamiento que el propio autor advierte que no constituye una evaluacion. El repositorio omite el estado de entrenamiento, por lo que no permite reanudar el proceso de forma exacta.

## Capacidades

- Ejecucion de una unica tarea de manipulacion robotica: doblar un mantel por la mitad a partir de la instruccion "Fold the tablecloth in half.".
- Politica visomotora con entrada de tres camaras (alta y dos de muneca) y salida de acciones delta de articulaciones y pinza.
- Seguimiento de instrucciones en lenguaje natural en ingles para condicionar la politica.
- Adaptacion al esquema de control ALOHA (acciones conjuntas y de pinza).
- Inferencia en el stack OpenPI sobre JAX con checkpoint Orbax.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni modos de razonamiento; es un modelo de politica robotica, no un LLM conversacional.

## Casos de uso

- Evaluacion comparativa de eficiencia de datos: replicar el ajuste fino con el 100 % de los episodios y comparar la tasa de exito frente a este checkpoint del 50 %, para medir cuanto aporta el volumen de datos en tareas de deformacion de tejidos.
- Linea base reproducible en investigacion: usar los pesos y las estadisticas de normalizacion publicados como referencia fija en experimentos de manipulacion con pi0.5, gracias a que el repositorio incluye `assets/` con estadisticas y los IDs de episodios seleccionados.
- Pruebas de integracion en OpenPI: validar pipelines de inferencia con la configuracion `pi05_fold_cloth_real` y el esquema ALOHA antes de desplegar politicas propias.
- Estudio de sensibilidad a la semilla: el autor documenta semilla 42 tanto en muestreo como en entrenamiento, lo que facilita reproducir y variar la seleccion de episodios para analizar varianza.
- Prototipado de doblado de tejidos en laboratorio: emplear la politica como punto de partida en un banco de pruebas con camaras alta y de muneca, siempre que el hardware sea compatible con ALOHA.
- Docencia y demostraciones: ilustrar el flujo completo de ajuste fino de un modelo vision-lenguaje-accion sobre una tarea concreta con presupuesto acotado (13.560 pasos, lote 128).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los resultados de evaluacion de la politica aun no se han reportado y que la perdida de entrenamiento (0,0013 en el paso 13.500) no establece exito en la tarea ni compatibilidad con robots.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, pero no se desglosa el tamano de los parametros ni el pico de memoria en ejecucion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el stack OpenPI/JAX y el formato Orbax condicionan el despliegue mas que el tamano del checkpoint.
- Opciones de despliegue: OpenPI sobre JAX con la configuracion personalizada `pi05_fold_cloth_real`; requiere descargar `params/**` y `assets/**` conservando la estructura de directorios. No es compatible con `from_pretrained` de Transformers, ni se documentan rutas vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-fold-cloth-50pct | no disponible | no disponible | Doblado de mantel (50 % de episodios) | no disponible | Hugging Face, Orbax |
| pi0.5 base (pi05_base) | no disponible | no disponible | Politica generalista vision-lenguaje-accion | no disponible en esta ficha | Checkpoint referenciado en `gs://openpi-assets` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parametros, contexto ni rendimiento con otras politicas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni resultados de politica; la perdida de entrenamiento no es un indicador valido de rendimiento.
- Especializacion extrema: solo ejecuta la instruccion de doblar el mantel por la mitad; no generaliza a otras tareas ni instrucciones.
- Compatibilidad de hardware no verificada: el autor advierte que no se ha establecido la compatibilidad con robots concretos.
- Dependencia del stack: requiere el codigo OpenPI personalizado y la configuracion `pi05_fold_cloth_real`; no funciona como modelo de Transformers.
- Sin estado de entrenamiento: no permite reanudar el entrenamiento de forma exacta, solo inferencia y evaluacion.
- Licencia sin especificar: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idioma: instrucciones solo en ingles.
- Riesgo de sobreajuste al subconjunto: entrenado con el 50 % de los episodios y 15 epocas, sin datos publicados sobre generalizacion a escenas no vistas.
- Sesgos: no documentados; al ser un modelo de robotica entrenado con un dataset propio y reducido, puede heredar sesgos de las condiciones de captura (iluminacion, disposicion de camaras, tipo de tejido).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zachttang/pi05-fold-cloth-50pct
- Checkpoint base referenciado: `gs://openpi-assets/checkpoints/pi05_base/params` (no es una URL web)
- Repositorio OpenPI: no disponible en la informacion proporcionada
- Paper de pi0.5: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
