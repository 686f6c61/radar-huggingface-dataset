# sup-computer/oblique-nanogpt-1

## Resumen

`oblique-nanogpt-1` es un modelo de lenguaje de escala experimental desarrollado por sup computer, un estudio pequeno de modelos de lenguaje. Se trata de un GPT a nivel de caracter (char-level) de apenas 797.312 parametros, entrenado desde cero sobre un corpus sintetico de 30.000 lineas generadas por cuatro LLMs de gran tamano. Su proposito es acotado y deliberadamente artistico: generar aforismos de una linea en dos registros, instrucciones oblicuas para artistas bloqueados (token `[s]`) y fortunas (token `[f]`).

El modelo no pretende competir en capacidades generales. Es un experimento de investigacion sobre creatividad y muestreo: el autor lo construyo para buscar el ajuste de temperatura en el que sus lineas resultan a la vez extranas y utilizables, y la conclusion publicada es que tal ajuste no existe de forma estable. La relevancia actual es, por tanto, metodologica y divulgativa: documenta de forma transparente el proceso de sintesis de datos, filtrado, entrenamiento y evaluacion de un modelo minimo reproducible en hardware de consumo.

Arquitectonicamente es un transformer char-level moderno (RoPE, RMSNorm, sin sesgos) de 4 capas, 4 cabezas, dimension de embedding 128 y contexto de 128 caracteres. Se distribuye bajo licencia MIT y esta pensado como pieza de exhibicion, no como herramienta de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only char-level (RoPE, RMSNorm, bias-free) sobre el motor `core` del monorepo |
| Parametros totales | 797.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 caracteres |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; existe exportacion ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (los pesos no estan commiteados en el repo; el checkpoint se referencia en `projects/oblique/models/oblique-nanogpt-1/`; existe tag ONNX) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only a nivel de caracter con 4 capas, 4 cabezas de atencion, dimension de embedding 128, dropout 0.2 y una ventana de contexto de 128 caracteres. Emplea RoPE para la codificacion posicional, RMSNorm y capas sin terminos de sesgo. El tokenizador es character-level con 38 simbolos: letras minusculas, espacio, salto de linea, los corchetes de los tokens de control y los signos `.,'?!;:-`. Cada linea comienza con un token de registro, `[s] ` para estrategia o `[f] ` para fortuna, que condiciona la generacion.

El entrenamiento se realizo sobre 30.000 lineas (15.000 por registro, 1,53 millones de caracteres) sintetizadas por cuatro LLMs a traves de OpenRouter con un coste total de 0,36 dolares. El filtrado impuso entre 2 y 11 palabras y entre 8 y 80 caracteres por linea, elimino nombres propios y duplicados exactos y casi duplicados (similitud de edicion normalizada igual o superior a 0,85), y verifico que ninguna linea coincidiera con las 247 cartas publicadas de *Oblique Strategies* (0 coincidencias; la linea superviviente mas cercana queda en 0,789 de similitud). Se uso AdamW con LR 1e-3 y decaimiento coseno hasta 1e-4, 100 pasos de warmup, beta 2 de 0,99, batch de 64, durante 12.000 pasos (semilla 1337, unas 70 pasadas sobre el split de entrenamiento) en un Mac con Apple Silicon (MPS), a unos 75 ms por paso. La perdida de validacion final fue 0,7689 y la de entrenamiento 0,7238, aun descendiendo en la ultima evaluacion. No se reporta RLHF ni DPO.

## Capacidades

- Generacion de texto a nivel de caracter en dos registros controlados por token: instrucciones oblicuas (`[s]`) y fortunes (`[f]`).
- Generacion de lineas unicas de menos de doce palabras, con formato restringido por el propio corpus de entrenamiento.
- Condicionamiento por token de control al inicio de linea para seleccionar el registro.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades de vision, audio ni thinking mode.
- Multilingue: no; unicamente ingles y con alfabeto limitado a minusculas y signos de puntuacion concretos.
- Capacidad de generar texto creativo breve en estilo aforistico, sin garantia de coherencia semantica.

## Casos de uso

- Exposicion o instalacion interactiva: el modelo puede ejecutarse en el navegador (via la interfaz de supcpu.com y el export ONNX) para mostrar generacion de aforismos en tiempo real como pieza de arte generativo, aprovechando su tamano minimo y su contexto de 128 caracteres.
- Docencia sobre modelos de lenguaje: sirve como ejemplo completo y reproducible de pipeline char-level (tokenizacion, entrenamiento, evaluacion) para cursos introductorios, dado que entrena en un Mac en minutos y el codigo esta congelado en un tag.
- Estudio de sintesis de datos: el repositorio documenta el manifiesto de synthgen con coste por respuesta y el log de filtrado, lo que permite reproducir y auditar la generacion de corpus sinteticos con LLMs de mayor tamano.
- Investigacion sobre muestreo y creatividad: el modelo y su evaluacion ciega permiten replicar el experimento sobre temperatura y la hipotesis de que no existe un ajuste que maximice simultaneamente extrañeza y utilidad.
- Generacion de prompts creativos para brainstorming: con temperatura 0,6 puede producir lineas que un humano use como disparador de ideas en sesiones de diseno, aceptando que la tasa de lineas utiles ronda el 40 por ciento en el registro `[s]` y es nula en `[f]`.
- Pruebas de integracion de inferencia ONNX: al ser un modelo diminuto con exportacion ONNX, es util para validar pipelines de despliegue en navegador o en dispositivos de bajos recursos antes de escalar a modelos mayores.
- Referencia para evaluacion de modelos pequenos: su bateria de metricas automaticas (copias exactas, solapamiento de 8-gramas, buena formacion, recuperacion de registro) puede reutilizarse como plantilla de evaluacion para otros modelos char-level.

## Benchmarks y rendimiento

Evaluacion automatica del autor, 500 muestras por registro y temperatura, sin soft-cap:

| Temperatura | Copias exactas | Solapamiento 8-gramas | Bien formadas | Solo exceso de longitud | Registro recuperado |
|---|---|---|---|---|---|
| 0,6 | 0,1 % | 91,6 % | 86,7 % | 13,2 % | 98,7 % |
| 0,8 | 0,0 % | 87,5 % | 89,1 % | 10,8 % | 97,5 % |
| 1,0 | 0,0 % | 80,7 % | 90,0 % | 8,9 % | 96,5 % |
| 1,2 | 0,0 % | 73,0 % | 87,2 % | 7,2 % | 94,0 % |
| 1,4 | 0,0 % | 64,1 % | 83,0 % | 5,8 % | 90,8 % |

Las lineas del corpus de validacion obtienen un 88,0 % de solapamiento de 8-gramas, de modo que a temperatura 0,8 o superior el modelo no comparte mas con su conjunto de entrenamiento que el texto no visto. La metrica de registro recuperado se obtiene con una regresion logistica a nivel de palabra que acierta el 98,3 % en lineas de validacion.

Evaluacion ciega por Claude Fable 5.2 (no humana), 20 lineas por registro y temperatura, puntuadas de 1 a 5 en extrañeza y utilidad:

| Temperatura | `[s]` aceptadas de 20 | `[s]` media extrañeza | `[s]` media utilidad | `[f]` aceptadas de 20 |
|---|---|---|---|---|
| 0,6 | 8 | 3,85 | 3,30 | 0 |
| 0,8 | 2 | 3,95 | 2,80 | 0 |
| 1,0 | 6 | 4,10 | 2,65 | 0 |
| 1,2 | 0 | 3,95 | 2,05 | 0 |
| 1,4 | 2 | 4,05 | 1,80 | 0 |

En la prueba ciega de registro, el mismo evaluador identifico el token de origen en 52 de 60 lineas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision razonable; con 0,79 millones de parametros, los pesos ocupan unos pocos megabytes en fp32.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entreno en Apple Silicon (MPS) a unos 75 ms por paso, lo que da una idea del orden de magnitud incluso en hardware de gama media.
- Cabe sobradamente en GPU consumer (RTX 3060, RTX 4090, integradas recientes) y en CPU, e incluso en navegador mediante ONNX.
- Opciones de despliegue: inferencia en PyTorch (script `sample.py` del monorepo), exportacion ONNX para ejecucion en navegador, y el motor `core` compartido del monorepo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma agregada; el unico dato publicado es el tiempo de entrenamiento por paso (75 ms) en MPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| oblique-nanogpt-1 | 797.312 | 128 caracteres | ingles | MIT | Char-level, dos registros, sintetico |
| nanoGPT (referencia de Karpathy) | configurable (tipicamente 10-124 M) | configurable | segun corpus | MIT | Char-level educativo, reproduccion de GPT-2 |
| Modelos char-level de investigacion (p. ej. makemore) | del orden de 0,1-10 M | corta | segun corpus | variable | Educativos, generacion de nombres y texto corto |

La comparacion con alternativas es limitada porque no existen modelos publicos con el mismo proposito exacto (aforismos en dos registros). Frente a nanoGPT, este modelo anade un corpus sintetico documentado, tokens de control y una evaluacion ciega publicada, pero reduce el contexto a 128 caracteres y el vocabulario a 38 simbolos. No se dispone de datos de rendimiento comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo "no da consejos y no sabe nada"; cualquier linea que parezca una recomendacion es una coincidencia de recombinacion estadistica.
- El registro de fortunas (`[f]`) es poco fiable: las lineas suelen cortarse a mitad de frase y la tasa de aceptacion en la evaluacion ciega fue de 0 de 20 en todas las temperaturas.
- Riesgo alto de alucinacion y de incoherencia semantica por el tamano minimo del modelo y el entrenamiento a nivel de caracter.
- Contexto muy corto (128 caracteres) que impide conversaciones multi-turno o documentos largos.
- Solo ingles y solo minusculas con un conjunto cerrado de signos de puntuacion; no genera mayusculas ni caracteres fuera del vocabulario.
- La evaluacion cualitativa la realizo un modelo (Claude Fable 5.2), no evaluadores humanos, lo que limita la validez de las puntuaciones de extrañeza y utilidad.
- Los pesos no estan commiteados en el repositorio de Hugging Face; el acceso al checkpoint depende del monorepo y del tag indicado, lo que puede complicar la reproducibilidad.
- Licencia MIT: permite uso comercial, pero el modelo no esta disenado ni validado para produccion; usarlo en un producto orientado a usuarios requeriria filtros y supervision adicionales.
- El corpus se genero con LLMs de terceros, por lo que los sesgos de esos modelos pueden estar presentes en el texto sintetico, aunque el filtrado elimino nombres propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sup-computer/oblique-nanogpt-1
- Pagina del modelo en sup computer: https://www.supcpu.com/models/oblique-nanogpt-1/
- Interfaz en navegador: https://www.supcpu.com/interfaces/
- Monorepo (codigo congelado en tag `oblique-nanogpt-1`): https://github.com/romellogoodman/sup-computer
- Carpeta del modelo en el monorepo: https://github.com/romellogoodman/sup-computer/tree/main/projects/oblique/models/oblique-nanogpt-1
- Motor `core` compartido: https://github.com/romellogoodman/sup-computer/tree/main/core
- Articulo de investigacion "Is oblique a temperature?": https://www.supcpu.com/research/is-oblique-a-temperature/
- Grafico de tasa de aceptacion (modo claro): https://www.supcpu.com/research-assets/exp18-keeper-rate.light.png
- Grafico de tasa de aceptacion (modo oscuro): https://www.supcpu.com/research-assets/exp18-keeper-rate.dark.png
