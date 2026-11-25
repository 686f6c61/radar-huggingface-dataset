# wolfoftizirane/Coilstellaration-resmlp-lm-fixed

## Resumen

Coilstellaration-resmlp-lm-fixed es un modelo ONNX desarrollado por el usuario wolfoftizirane para la pista `fixed_shape` del proyecto CoilStellaration, una iniciativa de Proxima Fusion orientada al diseno de bobinas para reactores de fusion estelarator. El modelo resuelve un problema de optimizacion inversa: dado un contorno de plasma (representado por coeficientes de Fourier en las componentes radial-coseno y vertical-seno) y un conjunto de cuatro metricas de requisitos, propone la geometria de las bobinas y las corrientes necesarias para satisfacerlas.

La arquitectura combina un perceptron multicapa residual (residual MLP) que genera una propuesta inicial de bobinas y corrientes, seguido de un corrector de Levenberg-Marquardt embebido en el mismo grafo ONNX que refina esa propuesta hasta cumplir los cuatro requisitos fisicos. Esta integracion del optimizador numerico dentro del grafo exportado es la caracteristica tecnica mas distintiva del modelo, ya que elimina la dependencia de un bucle de optimizacion externo en tiempo de inferencia.

El modelo es de proposito muy especifico, esta disenado exclusivamente para ejecucion en CPU mediante ONNX Runtime con `CPUExecutionProvider` y no dispone de documentacion publica sobre parametros, contexto, idiomas ni benchmarks. Su relevancia radica en el nicho de aplicacion (diseno de bobinas para fusion) y en la tecnica de embeber un solver iterativo en un grafo ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP residual con corrector Levenberg-Marquardt embebido en grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresion geometrica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX, presumiblemente float32) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se compone de dos etapas dentro de un unico grafo ONNX. La primera es un perceptron multicapa residual que, a partir de las entradas `boundary_r_cos` (forma `[n_pol, n_tor]`), `boundary_z_sin` (forma `[n_pol, n_tor]`), `requirement_metrics` (forma `[4]`) y los escalares enteros `n_field_periods` y `n_coils_per_half_period`, produce una propuesta inicial de coordenadas de bobina (`coil_x_n`, `coil_y_n`, `coil_z_n`, cada una de forma `[5, 15]`) y de corrientes (`currents`, forma `[5]`). La segunda etapa es un corrector de Levenberg-Marquardt que ajusta iterativamente esas propuestas para satisfacer los cuatro requisitos fisicos codificados en `requirement_metrics`.

El entrenamiento se realizo exclusivamente sobre el split de entrenamiento del dataset `proxima-fusion/coilstellaration`; segun la model card, el split de evaluacion no se utilizo para entrenamiento, ajuste ni seleccion de modelo. No se especifican en la informacion disponible el numero de tokens o muestras, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (lo cual es esperable que no, dado que no es un modelo generativo de lenguaje). La innovacion tecnica destacable es la inclusion del corrector numerico dentro del grafo ONNX, lo que permite ejecutar la optimizacion completa en una sola pasada de ONNX Runtime sin infraestructura adicional.

## Capacidades

- Prediccion de geometria de bobinas: genera coordenadas tridimensionales de bobinas (`coil_x_n`, `coil_y_n`, `coil_z_n`) con forma `[5, 15]` a partir de un contorno de plasma.
- Prediccion de corrientes: estima las corrientes (`currents`, forma `[5]`) asociadas a cada bobina.
- Correccion iterativa integrada: el corrector de Levenberg-Marquardt dentro del grafo ajusta la propuesta para cumplir cuatro metricas de requisitos fisicos.
- Parametrizacion variable: acepta `n_field_periods` y `n_coils_per_half_period` como escalares, lo que permite adaptar la topologia de la maquina.
- Ejecucion en CPU: disenado para ONNX Runtime con `CPUExecutionProvider`, sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Diseno exploratorio de bobinas en estelaradores: dado un contorno de plasma candidato y unas metricas de requisito, el modelo devuelve una geometria de bobina y corrientes factibles en una sola inferencia, lo que permite barrer rapidamente el espacio de configuraciones antes de pasar a simulaciones de mayor fidelidad.
- Prototipado en portatiles y estaciones sin GPU: al ejecutarse exclusivamente en CPU mediante ONNX Runtime, permite a investigadores probar configuraciones de bobina en equipos de sobremesa (el autor lo desarrollo en un Apple M4) sin acceso a clústeres.
- Integracion en pipelines de optimizacion de mayor nivel: el grafo ONNX puede incrustarse como un bloque de evaluacion rapida dentro de un bucle de optimizacion externo (por ejemplo, busqueda bayesiana o evolutiva) que use las salidas del modelo como punto de partida.
- Generacion de datasets sinteticos de bobinas: al producir pares (contorno, bobinas, corrientes) de forma rapida, puede usarse para aumentar el volumen de datos de entrenamiento de correctores o sustitutos mas precisos.
- Validacion de la viabilidad de requisitos: las cuatro metricas de entrada permiten comprobar si una combinacion de requisitos es alcanzable por el modelo, util como filtro previo en estudios de diseno.
- Docencia y divulgacion en fisica de fusion: el modelo sirve como ejemplo didactico de como embeber un solver numerico (Levenberg-Marquardt) en un grafo ONNX y de la aplicacion de ML al diseno de reactores.
- Despliegue en entornos embebidos o de borde: al no requerir GPU ni dependencias pesadas, puede ejecutarse en dispositivos con CPU modesta dentro de herramientas de visualizacion o configuradores interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta disenado para ejecucion exclusiva en CPU (`CPUExecutionProvider`), sin uso de GPU.
- GPU recomendadas: ninguna; el autor indica explicitamente CPU only.
- Compatibilidad con GPU de consumo: no aplica (no se ejecuta en GPU).
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`; el grafo incluye el corrector Levenberg-Marquardt, por lo que no requiere un bucle de optimizacion externo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que se desarrollo y probo en una CPU Apple M4.
- Huella de almacenamiento: el repositorio ocupa 0.0 GB segun Hugging Face, lo que sugiere un modelo de muy pocos parametros.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada otros modelos publicos de la pista `fixed_shape` de CoilStellaration ni alternativas comparables de diseno de bobinas basadas en MLP residual con corrector embebido en ONNX.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo solo aborda la pista `fixed_shape` de CoilStellaration; no es un modelo de lenguaje ni un modelo generalista.
- Sin documentacion de parametros: no se publican el numero de parametros, la arquitectura exacta de las capas residuales ni el numero de iteraciones del corrector Levenberg-Marquardt.
- Sin benchmarks publicos: no hay metricas de error geometrico, cumplimiento de requisitos ni comparaciones con lineas base, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de propuestas fisicamente invalidas: al ser un modelo de regresion entrenado sobre un dataset concreto, puede producir geometrias de bobina o corrientes que no satisfagan los requisitos en configuraciones fuera de la distribucion de entrenamiento; el corrector integrado mitiga pero no garantiza la validez.
- Dependencia de la distribucion del dataset: el entrenamiento se limito al split de entrenamiento de `proxima-fusion/coilstellaration`; el rendimiento en topologias con `n_field_periods` o `n_coils_per_half_period` distintos a los vistos en entrenamiento es incierto.
- Sin soporte de GPU: la ejecucion esta limitada a CPU, lo que puede ser un cuello de botella si se necesita un throughput muy alto en barridos masivos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre la idoneidad del modelo para aplicaciones criticas de ingenieria.
- Sin informacion sobre sesgos: no se documentan sesgos, aunque al ser un modelo fisico los sesgos relevantes serian los derivados de la cobertura del dataset de entrenamiento.
- Repositorio sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wolfoftizirane/Coilstellaration-resmlp-lm-fixed
- Proyecto CoilStellaration (GitHub): https://github.com/proximafusion/coilstellaration
- Dataset de entrenamiento: https://huggingface.co/datasets/proxima-fusion/coilstellaration
