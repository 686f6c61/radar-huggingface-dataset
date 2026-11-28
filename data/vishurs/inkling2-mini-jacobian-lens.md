# vishurs/inkling2-mini-jacobian-lens

## Resumen

`vishurs/inkling2-mini-jacobian-lens` no es un modelo de lenguaje, sino un artefacto de interpretabilidad: una matriz jacobiana `J` de forma `[2304, 2304]` en `float32` que aproxima linealmente la transformacion que sufre el estado oculto de un modelo llamado Inkling 2 Mini entre la capa 20 (denominada "visit 44" en la nomenclatura del autor) y el estado final previo a la ultima normalizacion. El autor la publica en el contexto del "Looped Lens Challenge", un ejercicio de analisis de modelos con arquitecturas de capas repetidas.

El artefacto se calcula promediando la derivada del estado final respecto al estado de entrada a la capa 20 para el mismo token, sobre 400 pasajes de texto de FineWeb. El resultado se usa como una lente: dado un estado `h` en esa capa, se puede leer su proyeccion al espacio de logits mediante `lm_head(norm(h @ J.T))`, lo que permite inspeccionar que token "predice" el modelo en una capa intermedia sin ejecutar el resto del forward pass.

Su relevancia es acotada y experimental: sirve para estudiar como evoluciona la representacion interna de Inkling 2 Mini a lo largo de sus capas repetidas, pero no permite generar texto, no es desplegable como modelo y no incluye pesos del modelo base. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y su tamano es de 0.0 GB (probablemente por redondeo, dado que una matriz de 2304x2304 en float32 ocupa unos 21 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matriz jacobiana lineal (no es un modelo neuronal) |
| Parametros totales | 2304 x 2304 = 5.308.416 valores float32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Inkling 2 Mini) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en float32) |
| Idiomas soportados | no disponible (el corpus de calibracion es FineWeb, mayoritariamente ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`jacobian_v44.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un transformer ni un modelo generativo: es una aproximacion de primer orden (jacobiano) de la funcion que transforma el estado oculto en la capa 20 hasta el estado final antes de la normalizacion, en el mismo token. La dimension 2304 sugiere un modelo base con hidden size de 2304, consistente con un modelo de aproximadamente 1-2 mil millones de parametros, aunque el autor no especifica la configuracion exacta de Inkling 2 Mini.

El calculo se realiza promediando la derivada sobre 400 pasajes de FineWeb. La nomenclatura "visit 44 (layer 20)" indica que el modelo base aplica un esquema de capas repetidas o en bucle (looped), de modo que la capa fisica 20 se visita 44 veces en el grafo computacional. La lente permite leer estados intermedios proyectandolos al espacio de logits con `lm_head(norm(h @ J.T))`. No se documenta el metodo exacto de estimacion del jacobiano (autograd completo, aproximacion por diferencias finitas o similar), ni si se aplico regularizacion.

## Capacidades

- Lectura de estados ocultos intermedios: permite proyectar un estado `h` de la capa 20 al espacio de logits sin ejecutar el resto del modelo.
- Analisis de representaciones en arquitecturas con capas repetidas: facilita estudiar como se transforma la informacion entre visitas.
- Interpretabilidad mecanistica: sirve para comparar la prediccion temprana con la prediccion final del modelo base.
- No genera texto, no responde prompts, no soporta tool calling ni agentes.
- No tiene capacidades multimodales, de audio ni de vision.
- No soporta multilingue por si mismo; hereda las limitaciones del corpus de calibracion (FineWeb).

## Casos de uso

- Analisis de logit lens en modelos con capas en bucle: aplicar la matriz `J` a estados de la capa 20 para obtener una distribucion de tokens temprana y compararla con la salida final, identificando en que visita se "decide" la prediccion.
- Investigacion de interpretabilidad mecanistica: estudiar la evolucion de la representacion interna de Inkling 2 Mini y detectar si la informacion se consolida antes o despues de la capa 20.
- Diagnostico de modelos looped: verificar si las visitas repetidas anaden informacion nueva o si el modelo satura su representacion, usando la lente como sonda lineal.
- Reproduccion de experimentos del Looped Lens Challenge: el artefacto esta pensado explicitamente para este reto, por lo que sirve como referencia para comparar metodos de estimacion de lentes.
- Docencia y divulgacion: ejemplo concreto de como construir una lente jacobiana y aplicarla a un modelo real, con un fichero pequeno y facil de inspeccionar.
- Validacion de pipelines de interpretabilidad: al ser una matriz de 21 MB en safetensors, se puede usar como caso de prueba para herramientas de carga y visualizacion de artefactos de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21 MB para cargar la matriz en float32; el modelo base Inkling 2 Mini requiere su propia VRAM, no especificada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede alojar la matriz; el cuello de botella es el modelo base.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU, ya que la matriz es pequena.
- Opciones de despliegue: carga directa con `safetensors` en Python; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles; la multiplicacion `h @ J.T` para un vector de 2304 dimensiones es del orden de microsegundos en GPU y milisegundos en CPU.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada otros artefactos jacobianos publicados para modelos looped con los que comparar directamente. Como referencia conceptual, existen tecnicas como logit lens y tuned lens, pero no se dispone de artefactos comparables con especificaciones publicadas en este contexto.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no se puede usar para generar texto, responder preguntas ni ejecutar tareas de NLP.
- Depende de un modelo base (Inkling 2 Mini) cuyos pesos no se incluyen en el repositorio; sin ellos, la lente no es utilizable.
- La aproximacion es lineal y de primer orden: solo es valida en un entorno local alrededor de los estados observados en FineWeb, y puede degradarse fuera de esa distribucion.
- El jacobiano se promedia sobre 400 pasajes de FineWeb, un corpus mayoritariamente en ingles; su comportamiento en otros idiomas o dominios no esta validado.
- No se documenta el metodo de estimacion ni la varianza entre pasajes, lo que limita la reproducibilidad.
- La licencia MIT permite uso comercial del artefacto, pero el uso del modelo base puede estar sujeto a otra licencia no especificada.
- Riesgo de interpretacion erronea: una proyeccion temprana a logits no implica que el modelo "piense" ese token; es una sonda lineal, no una explicacion causal.
- El repositorio tiene 0 descargas y 1 like, sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/vishurs/inkling2-mini-jacobian-lens
- Modelo base Inkling 2 Mini: no disponible en la informacion proporcionada
- Looped Lens Challenge: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
