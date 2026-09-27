# sxtylws/laya-multilingual

## Resumen

Laya Multilingual es un modelo de decisión no autorregresivo de tipo System 1 desarrollado por Convai Innovations, publicado en Hugging Face bajo el identificador `sxtylws/laya-multilingual`. A diferencia de un modelo generativo, no produce texto: recibe un estado (texto libre, correo electrónico, ticket o JSON) y un conjunto de preguntas tipadas, y devuelve respuestas tipadas acompañadas de probabilidades en un único forward pass. Este diseño elimina la necesidad de parsear la salida y reduce el riesgo de alucinación, ya que no hay texto que generar.

El modelo se basa en el encoder mmBERT-base y cuenta con 321.908.998 parámetros (aproximadamente 322 millones). Forma parte de la familia Laya, cuya variante principal (`convaiinnovations/laya`) emplea ModernBERT-large con 421M parámetros y está orientada a inglés, mientras que este checkpoint cubre más de 100 idiomas y es aproximadamente el doble de rápido. La ventana de contexto nativa es de 1.024 tokens, ampliable hasta 8.192 mediante el parámetro `max_len`.

Su relevancia actual radica en la combinación de calibración de probabilidades, cobertura multilingüe amplia y latencia reducida (en el entorno de los 33 ms según el autor), lo que lo sitúa como candidato para tareas de clasificación, enrutado, guardrails y moderación en producción. El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (System 1), basado en mmBERT-base |
| Parametros totales | 321.908.998 (322M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens nativos, ampliable hasta 8.192 mediante `max_len=8192` |
| Tipos de cuantizacion | No disponible (solo se confirma safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Mas de 100 idiomas, entre ellos en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Pipeline | text-classification |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de encoder transformer no autorregresivo construida sobre mmBERT-base. La inferencia consiste en un único forward pass que produce logits sobre un conjunto cerrado de opciones definidas por el usuario, junto con una distribución de probabilidad calibrada. Las preguntas se tipan mediante esquemas como `choice` (selección entre opciones con criterios), `noul` (pregunta de sí o no) o `scoring`, de modo que la salida es estructurada y directamente consumible. No hay decodificación autoregresiva, muestreo ni temperatura que ajustar.

El autor indica que el entrenamiento se apoya en RLCD (Reinforcement Learning from Calibrated Decisions), una técnica de ajuste orientada explícitamente a mejorar la calibración de las probabilidades (medida con ECE, Expected Calibration Error) en lugar de solo la precisión. Esta elección responde al problema observado en el checkpoint inglés: fuera del inglés, aquel modelo colapsa en precisión sin que su confianza disminuya, de modo que el filtrado por umbral de confianza no detecta el fallo. La evaluación se realizó sobre el conjunto MASSIVE (51 idiomas) y sobre XNLI (15 idiomas), aunque la información disponible no detalla la composición exacta del corpus de entrenamiento ni el número total de tokens.

## Capacidades

- Clasificacion de intenciones en mas de 100 idiomas con opciones definidas por el usuario (tipo `choice`, con criterios descriptivos por clase).
- Respuestas booleanas tipadas (tipo `noul`, por ejemplo "¿el remitente pide un reembolso?").
- Puntuacion o scoring de estados sobre escalas definidas por el desarrollador.
- Salida con probabilidades calibradas para cada respuesta, lo que permite umbrales de decision y enrutado por confianza.
- Enrutado multilingue automatico mediante la clase `Router`, que selecciona entre los checkpoints `laya` (ingles) y `laya-multilingual` segun el script del texto de entrada, antes del forward pass.
- Preload de multiples checkpoints residentes en memoria para evitar el intercambio en cada cambio de idioma.
- Integracion externa de deteccion de idioma mediante el parametro `lang_guess`.
- Procesamiento de documentos largos hasta 8.192 tokens.
- Uso como sistema de guardrails y moderacion (etiquetado en la propia ficha del modelo).
- No dispone de generacion de texto, vision, audio, tool calling ni razonamiento multi-paso: es exclusivamente un modelo de decision y clasificacion.

## Casos de uso

- Enrutado de tickets de soporte: dado el cuerpo de un ticket en cualquier idioma, el modelo devuelve la categoria (`billing`, `technical`, `sales`) con su probabilidad. El ejemplo de la documentacion muestra un caso en hindi clasificado como `billing`, lo que ilustra su uso en mesas de ayuda multilingues donde antes hacia falta un modelo por idioma.
- Deteccion de solicitudes de reembolso: con una pregunta tipada `noul`, el modelo responde si el remitente pide dinero de vuelta, lo que permite activar flujos automaticos de reembolso sin parsear texto libre.
- Moderacion de contenido: al devolver probabilidades calibradas, puede aplicarse un umbral conservador para marcar contenido dudoso y derivarlo a revision humana, en lugar de depender de una generacion de texto con salida impredecible.
- Guardrails en agentes conversacionales: el modelo puede comprobar si una respuesta propuesta cumple politicas definidas como opciones tipadas antes de enviarla al usuario final.
- Clasificacion de correo entrante en pipelines de CRM: procesa cuerpos de correo con acentos eliminados (castellano, italiano, portugues o frances sin tildes) y portugues de Brasil, casos que el autor menciona como frecuentes en sistemas de correo y ticketing.
- Analisis de documentos largos multilingues: con `max_len=8192` puede procesar contratos, informes o hilos de correo extensos; el autor advierte que la precision se mantiene en 16-18 de 20 peticiones hasta unos 4.000 tokens y baja a 8-17 de 20 por encima de esa longitud.
- Enrutado de entrada en arquitecturas mixtas: la clase `Router` decide que checkpoint atiende cada peticion segun el script detectado, util en plataformas con trafico en decenas de idiomas y con requisitos de latencia estrictos.
- Extraccion de decisiones estructuradas en backends: al devolver respuestas tipadas, se integra sin parseo de texto en servicios que necesitan un JSON con una clase y una probabilidad.

## Benchmarks y rendimiento

Clasificacion de intenciones sobre MASSIVE en los 51 idiomas del conjunto, con 20 opciones (nivel aleatorio = 0.050). Ambos checkpoints responden a preguntas identicas byte a byte.

| Metrica | laya (ingles) | laya-multilingual |
|---|---|---|
| Precision macro | 0.227 | 0.366 |
| ECE macro | 0.733 | 0.387 |
| Idiomas que superan 3x el azar | 23 / 51 | 45 / 51 |

Mejora por idioma en la misma tarea (precision):

| Idioma | laya (ingles) | laya-multilingual |
|---|---|---|
| Arabe | 0.110 | 0.400 |
| Bengali | 0.080 | 0.290 |
| Azeri | 0.100 | 0.300 |
| Hindi | 0.100 | 0.387 |
| Coreano | 0.110 | 0.490 |
| Turco | 0.140 | 0.437 |

Casos de colapso documentados del checkpoint ingles, todos reportados con confianza alta (0.89-0.96): khmer 0.000 de precision con 0.952 de confianza, hebreo 0.060, armenio 0.050 (exactamente aleatorio) y bengali 0.080. Su confianza media nunca baja de 0.885, por lo que el filtrado por umbral no lo detecta.

XNLI (15 idiomas): el checkpoint ingles obtiene 0.860 en ingles frente a 0.843 de `laya-multilingual`; los resultados de los otros 14 idiomas no estan completos en la informacion disponible.

Documentos largos: con ventana de 8.192 tokens, 16 a 18 de cada 20 peticiones se respondieron correctamente con hasta unos 4.000 tokens de texto previo. Por encima de esa longitud, los resultados varian entre 8 y 17 de 20. Una entrada de 4.000 tokens tarda aproximadamente 1,7 s en una GPU de Apple.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,3 GB en fp32 (322M parametros) y en torno a 0,65 GB en fp16/bf16, mas el overhead de activaciones, que es reducido porque la longitud maxima de entrada es 8.192 tokens.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente. El autor no publica una lista de GPU recomendadas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, asi como en portatiles con GPU discreta.
- Opciones de despliegue: el paquete oficial es `laya` (`pip install laya`), que se apoya en `transformers`. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI; al ser un encoder de clasificacion, la via natural es `transformers` o un servidor de inferencia propio.
- Latencia y throughput: el autor situa el motor de decision en el entorno de 33 ms y lo describe como sub-35 ms. En una GPU de Apple, una entrada de 4.000 tokens tarda aproximadamente 1,7 s. La velocidad sigue la longitud real de la entrada, no el limite `max_len`.
- Nota operativa: si `laya.load()` se bloquea, hay que ejecutar con `USE_TF=0`, porque la sonda de TensorFlow de `transformers` puede provocar un deadlock en la construccion del modelo.

## Comparativa con modelos similares

| Modelo | Encoder | Parametros | Contexto | Uso previsto | Licencia |
|---|---|---|---|---|---|
| laya-multilingual | mmBERT-base | 322M | 1.024 (hasta 8.192) | Mas de 100 idiomas, aprox. 2x mas rapido | Apache 2.0 |
| laya | ModernBERT-large | 421M | 512 | Ingles | Apache 2.0 |
| laya-typed-decisions | ModernBERT-large | 421M | 1.024 | Flujos de decisiones tipadas | Apache 2.0 |
| Jev | No disponible | No disponible | No disponible | Comparado con Laya en fuentes externas | No disponible |

Los tres checkpoints de la familia Laya comparten licencia Apache 2.0 y el mismo esquema de preguntas tipadas. `laya` es mas preciso en ingles (0.860 en XNLI frente a 0.843), mientras que `laya-multilingual` es claramente superior fuera del ingles en MASSIVE (0.366 frente a 0.227 de precision macro) y sustituye el colapso del modelo ingles por resultados utilizables en la mayoria de idiomas. No se dispone de especificaciones verificables de Jev en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo clasifica y devuelve decisiones, no genera texto. No sirve para tareas de redaccion, resumen, traduccion, codigo ni dialogo abierto.
- Fuera del ingles, la precision macro en MASSIVE es de 0.366 con 20 opciones (azar = 0.050). Es util, pero esta lejos de una precision alta: conviene validar en datos propios antes de desplegar.
- La calibracion mejora respecto al checkpoint ingles (ECE macro 0.387 frente a 0.733), pero sigue siendo imperfecta; un umbral de confianza no debe tratarse como garantia.
- La ventana nativa de 1.024 tokens trunca documentos largos si no se pasa `max_len=8192`. La precision en documentos largos decae mas alla de unos 4.000 tokens, con resultados entre 8 y 17 de 20 en las pruebas del autor.
- El autor recomienda comprobar la precision en documentos largos con datos propios, dado que los resultados varian.
- Existe una discrepancia en los identificadores: la informacion de HuggingFace asigna el repositorio a `sxtylws/laya-multilingual`, mientras que la model card apunta a `convaiinnovations/laya-multilingual`. Conviene verificar cual es el repositorio canonico y si los pesos coinciden.
- El enrutado se decide por el script de la entrada y no por la confianza del modelo, precisamente porque la confianza no avisa cuando un checkpoint no puede leer su entrada. Algunos textos (castellano, italiano, portugues o frances sin tildes, portugues de Brasil, peticiones CJK con marcas latinas, bangla romanizado o azeri) se derivan a este checkpoint aunque el script no lo determine.
- En 20.000 textos ingleses, como maximo 5 frases inglesas se desvian al checkpoint multilingue, todas citando nombres largos en script nativo.
- Riesgo de sesgo: la ficha no documenta analisis de sesgo por idioma, genero o dominio. La precision desigual entre idiomas (por ejemplo, coreano 0.490 frente a bengali 0.290) implica un trato desigual entre comunidades linguisticas.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, sin las restricciones tipicas de licencias de investigacion.

## Enlaces

- HuggingFace (identificador indicado en la informacion): https://huggingface.co/sxtylws/laya-multilingual
- Checkpoint canonico segun la model card: https://huggingface.co/convaiinnovations/laya-multilingual
- Familia Laya (checkpoint ingles): https://huggingface.co/convaiinnovations/laya
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio de codigo (recursos graficos): https://github.com/NandhaKishorM/laya
- Ficha tecnica y benchmarks: https://laya-ai.com/models/laya-multilingual
- Sitio del proyecto: https://laya-ai.com/
- Motor de decision (Convai Innovations): https://laya.convaiinnovations.com/
- Especificaciones y fuentes: https://www.gradually.ai/en/ai-models/laya-multilingual/
- Analisis independiente: https://tokenstead.ai/guides/laya-multilingual-decision-model
