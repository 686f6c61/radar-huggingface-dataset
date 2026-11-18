# zachttang/pi05-fold-cloth-100pct

## Resumen

pi05-fold-cloth-100pct es un conjunto de checkpoints de inferencia derivados de un entrenamiento con OpenPI sobre el modelo base pi05 (Physical Intelligence pi-zero-five). Lo publica el usuario zachttang en Hugging Face y su proposito es concreto: ejecutar una politica robotica de manipulacion que dobla un mantel por la mitad. No es un modelo de lenguaje generalista, sino una politica visuomotora que consume observaciones de camaras y estado articular y emite acciones de robot.

El entrenamiento se realizo con la configuracion `pi05_fold_cloth_real`, semilla 42, batch size 128 y un presupuesto de 15 epocas, bajo el identificador de ejecucion `fold_cloth_100pct_s42_bs128_e15_71890`. El sufijo "100pct" indica que se uso el subconjunto completo de episodios de entrenamiento disponibles (frente a variantes con subconjuntos parciales). El checkpoint base es `gs://openpi-assets/checkpoints/pi05_base/params`.

La relevancia es acotada pero clara para quien trabaja en robotica de manipulacion con OpenPI: ofrece pesos intermedios de retencion (pasos 4000 a 20000) para reproducir o comparar el ajuste fino de pi05 en una tarea de plegado de tela, con adaptacion ALOHA de articulaciones y pinzas. No se han publicado resultados de evaluacion de la politica ni se ha especificado licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica visuomotora pi05 (OpenPI), checkpoint base pi05_base; no se detalla la topologia interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (instrucciones de tarea en ingles) |
| Licencia | no disponible (el uploader no la ha especificado) |
| Formato de pesos | Orbax (checkpoints JAX), no Transformers `from_pretrained`; cada checkpoint incluye `params/` y `assets/` |

## Arquitectura y entrenamiento

El modelo es una politica pi05 ajustada mediante OpenPI. La configuracion `pi05_fold_cloth_real` aplica adaptacion ALOHA de articulaciones y pinzas, con acciones en espacio delta de articulaciones y tres camaras de entrada: `cam_high`, `cam_wrist_left` y `cam_wrist_right`. La instruccion de tarea es "Fold the tablecloth in half.".

El ajuste fino se realizo con semilla 42, batch size 128 y 15 epocas sobre el subconjunto completo de episodios (`100pct`). El autor distingue entre ejecuciones con LoRA y ejecuciones con ajuste fino completo; en esta ficha no se especifica cual de los dos se uso para este checkpoint concreto, por lo que se considera no disponible. Los checkpoints publicados son de retencion fija en los pasos 4000, 8000, 12000, 16000 y 20000, excluyen deliberadamente el estado del optimizador y del entrenamiento, e incluyen estadisticas de normalizacion e identificadores de episodios en `assets/`.

## Capacidades

- Generacion de acciones de robot para una unica tarea de manipulacion: doblar un mantel por la mitad.
- Percepcion visuomotora a partir de tres camaras (vista alta y dos vistas de muneca).
- Control de articulaciones y pinzas en espacio de acciones delta, con adaptacion ALOHA.
- Condicionamiento por instruccion de tarea en lenguaje natural (en ingles).
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni vision generalista.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Reproduccion de experimentos de plegado de tela: cargar los checkpoints de los pasos 4000 a 20000 con el codigo y la configuracion OpenPI correspondientes para comparar la evolucion de la politica a lo largo del entrenamiento.
- Linea base para ajuste fino en robotica: usar estos pesos como punto de partida para nuevas tareas de manipulacion de telas con el mismo esquema de camaras y acciones delta.
- Evaluacion de estrategias de retencion de checkpoints: analizar como varia el comportamiento entre pasos intermedios sin necesidad de reentrenar desde `pi05_base`.
- Investigacion en imitacion visuomotora: estudiar la transferencia de pi05 a una tarea fisica concreta con un presupuesto de 15 epocas y batch 128.
- Validacion de pipelines ALOHA: probar la integracion de observaciones de `cam_high`, `cam_wrist_left` y `cam_wrist_right` con acciones delta de articulaciones y pinzas en un entorno real o simulado.
- Docencia y divulgacion en robotica: demostrar el flujo completo de OpenPI, desde el checkpoint base hasta una politica especializada, con artefactos publicos y estructura de directorios documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los resultados de evaluacion de la politica aun no se han reportado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros ni huellas de memoria).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: requiere el codigo y la configuracion personalizados de OpenPI; los checkpoints son Orbax (JAX) y no se cargan con Transformers `from_pretrained`. Debe preservarse la estructura de directorios de cada checkpoint (`params/` y `assets/`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-fold-cloth-100pct | politica pi05 ajustada (OpenPI) | plegado de mantel | no disponible | no disponible | no disponible | checkpoints Orbax en Hugging Face |
| pi05_base | politica base pi05 | proposito general de robotica | no disponible | no disponible | no disponible | referenciado como `gs://openpi-assets/checkpoints/pi05_base/params` |
| Otras variantes `fold_cloth` del mismo autor | politicas pi05 ajustadas | plegado de mantel | no disponible | no disponible | no disponible | mencionadas en la model card (subconjuntos parciales y ejecuciones con LoRA) |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica instruccion ("Fold the tablecloth in half.") y no se garantiza su comportamiento fuera de esa tarea.
- Sin evaluacion publicada: no hay metricas de exito, por lo que no puede afirmarse su fiabilidad en produccion.
- Licencia no especificada: el uploader no ha definido licencia, lo que impide confirmar el uso comercial.
- Formato no estandar: son checkpoints Orbax que requieren el codigo y la configuracion OpenPI; no funcionan con cargadores genericos de Transformers.
- Estado de entrenamiento excluido: no se incluye el estado del optimizador, por lo que no sirven para reanudar el entrenamiento tal cual.
- Posible carga incompleta: el autor advierte que algunos checkpoints listados pueden seguir subiendose.
- Dependencia de hardware robotico: requiere una configuracion ALOHA con las tres camaras indicadas y control de articulaciones y pinzas.
- Idioma: las instrucciones estan en ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de modelos de lenguaje, pero no se documentan sesgos de la politica ni modos de fallo.

## Enlaces

- Hugging Face: https://huggingface.co/zachttang/pi05-fold-cloth-100pct
- Checkpoint base referenciado: `gs://openpi-assets/checkpoints/pi05_base/params`
- OpenPI (repositorio y documentacion del framework): no disponible en la informacion proporcionada
- Paper de pi05: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
