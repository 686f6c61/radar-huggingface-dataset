# tobygodat/looped-lens-translators

## Resumen

`looped-lens-translators` es un conjunto de lentes traductoras de bajo rango (low-rank translator lenses) ajustadas para el modelo Inkling 2 Mini de Thinking Machines, en el marco del Looped Lens Challenge organizado por NDIF. No se trata de un modelo de lenguaje generativo, sino de un artefacto de interpretabilidad: un conjunto de proyecciones lineales de bajo rango que permiten leer el estado oculto de una capa intermedia concreta a traves del unembedding final del propio modelo, sin necesidad de ejecutar el resto de la red.

El repositorio lo publica el usuario tobygodat bajo licencia MIT y ocupa 0.0 GB, lo que es coherente con su naturaleza: son matrices pequenas (`down`, `up`, `bias`) por cada capa visitada, no pesos de un transformer. El pipeline no esta declarado y el numero de descargas y likes es cero en el momento de la consulta, lo que indica que es un artefacto de investigacion reciente y de nicho.

Su relevancia es acotada pero concreta: facilita el analisis mecanicista de Inkling 2 Mini, permitiendo inspeccionar representaciones intermedias con una transformacion aprendida en lugar de recurrir a la proyeccion directa del estado por el unembedding, que suele dar lecturas ruidosas en capas tempranas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes lineales de bajo rango (matrices `down`, `up`, `bias`) sobre estados ocultos de Inkling 2 Mini |
| Parametros totales | no disponible (depende del rango y del numero de capas visitadas; no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Inkling 2 Mini, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (los tensores se almacenan en el formato original del repo, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | tensores propios (`down.V`, `up.V`, `bias.V`) y un fichero `control` con ids de tokens; no se especifica el contenedor exacto (probablemente safetensors o similar) |

## Arquitectura y entrenamiento

Cada lente opera sobre un unico punto de visita V (una capa del modelo base). El fichero contiene tres tensores: `down.V` de forma [hidden, rank], `up.V` de forma [hidden, rank] y `bias.V` de forma [hidden]. La aplicacion es determinista: se toma el estado x en una posicion de token, se normaliza con RMS-norm, se transforma mediante `x + (x @ down) @ up.T + bias` y el resultado se lee con la normalizacion final y el unembedding del propio Inkling 2 Mini. Es, por tanto, una correccion de rango bajo sobre la lectura directa del estado, no una capa nueva del transformer.

El ajuste de estas matrices se realizo para el Looped Lens Challenge y el codigo de entrenamiento y aplicacion esta en `research/trained/` del repositorio GitHub `tobygodat/looped-lens`. La model card no detalla el dataset de ajuste, el numero de tokens, la funcion de perdida exacta ni si hubo regularizacion adicional; tampoco se documenta el rango elegido ni el numero de capas cubiertas. El fichero `control` contiene los ids de tokens de control que se excluyen del softmax durante la lectura, un detalle relevante para reproducir fielmente las metricas del reto.

## Capacidades

- Lectura interpretativa de estados ocultos intermedios de Inkling 2 Mini mediante proyeccion de bajo rango aprendida.
- Aplicacion por capa: cada visita V dispone de sus propias matrices `down`, `up` y `bias`.
- Exposicion de tokens de control para excluirlos del softmax de lectura.
- Reproducibilidad del pipeline de ajuste y aplicacion a traves del codigo publicado en GitHub.
- No genera texto, no razona, no ejecuta codigo ni soporta tool calling: es un artefacto de analisis.
- No soporta agentes, multi-step reasoning ni capacidades multilingues propias.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Analisis mecanicista de circuitos internos: permite inspeccionar que informacion es linealmente decodificable en una capa concreta de Inkling 2 Mini sin ejecutar el resto de la red, util para localizar circuitos y representaciones.
- Investigacion de interpretabilidad comparada: al disponer de lentes por capa, se puede trazar como evoluciona la decodificabilidad de un concepto a lo largo de la profundidad del modelo.
- Reproduccion de resultados del Looped Lens Challenge: el artefacto y el codigo permiten replicar las metricas del reto y comparar con otras propuestas.
- Validacion de hipotesis sobre unembedding: sirve para contrastar si la lectura directa del estado por el unembedding final es suficiente o si una correccion de bajo rango mejora la fidelidad.
- Depuracion de comportamientos anomalos: identificar en que capa se vuelve decodificable un token problematico ayuda a diagnosticar alucinaciones o sesgos localizados.
- Docencia y divulgacion: ejemplo practico y ligero (0.0 GB) de tecnicas de lentes y proyecciones de bajo rango para cursos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y las matrices son de bajo rango, por lo que el coste de almacenamiento es minimo, pero la inferencia requiere cargar Inkling 2 Mini completo para aplicar las lentes.
- GPU recomendadas: no disponibles en la model card; dependen del modelo base Inkling 2 Mini, cuyas especificaciones no se detallan aqui.
- Ajuste en GPU de consumo: no confirmado; el rango bajo sugiere que el ajuste de las matrices podria hacerse en hardware modesto, pero no se documenta.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante el codigo de `research/trained/` del repositorio GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looped-lens-translators | Lentes de bajo rango para interpretabilidad | no disponible | no disponible | MIT | Hugging Face (0 descargas) |
| Otras lentes del Looped Lens Challenge | Lentes de bajo rango | no disponible | no disponible | segun autor | NDIF / Hugging Face |
| Logit lens clasico | Proyeccion directa por unembedding | 0 (sin parametros) | no aplica | no aplica | Implementaciones abiertas |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo es valido para Inkling 2 Mini; no es transferible a otros modelos sin reajuste.
- No es un modelo generativo: no debe usarse para tareas de texto, codigo o razonamiento.
- La model card no documenta sesgos, tasas de alucinacion ni evaluacion cualitativa; no hay garantias de fidelidad de las lecturas.
- El rango, el numero de capas cubiertas y el dataset de ajuste no se especifican, lo que dificulta evaluar su calidad frente a alternativas.
- El fichero `control` es imprescindible para reproducir las lecturas; omitirlo altera los resultados del softmax.
- Licencia MIT permite uso comercial del artefacto, pero el modelo base Inkling 2 Mini puede tener condiciones propias que deben respetarse.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente.
- El repositorio se creo y actualizo el mismo dia (2026-11-27), lo que sugiere un artefacto provisional o de participacion en el reto.

## Enlaces

- Hugging Face: https://huggingface.co/tobygodat/looped-lens-translators
- Modelo base Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Looped Lens Challenge: https://ndif.us/looped-lens-challenge/
- Codigo de ajuste y aplicacion: https://github.com/tobygodat/looped-lens (directorio `research/trained/`)
