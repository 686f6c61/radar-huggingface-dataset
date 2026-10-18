# wardenfox/kit-1-lite

## Resumen

Kit-1 Lite es un clasificador de texto muy pequeno publicado por WardenFox (wardenfox.com) bajo licencia MIT, disenado para una tarea muy concreta: recibir la ruta de una URL y etiquetarla como `safe`, `traversal`, `xss` o `sqli`. No es un modelo generativo ni un transformer: es una CNN a nivel de caracter (char-CNN) de 115.716 parametros y 466 KB de pesos que se ejecuta unicamente con NumPy, sin PyTorch, sin GPU y con un consumo de memoria en torno a 30 MB segun las mediciones del propio autor.

Su relevancia esta en el nicho: filtrado de peticiones HTTP con un coste computacional minimo y una integracion trivial (una funcion Python o un script de linea de comandos). Frente a los motores de reglas clasicos, el modelo aprende patrones a partir de ejemplos reales de trafico benigno y de colecciones publicas de payloads, lo que permite detectar variantes que un regex ingenuo no cubriria.

La informacion disponible es limitada en varios aspectos: el modelo solo declara soporte de ingles, la longitud de entrada esta fijada en 200 caracteres, cubre exclusivamente cuatro clases de ataque y no sustituye a un WAF. El repositorio es de 0.0 GB (redondeado), registra 0 descargas y 1 like en el momento de la consulta, y el autor lo presenta explicitamente como herramienta de investigacion, no como producto de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN a nivel de caracter: embedding por caracter, cuatro anchos de convolucion (2-5 caracteres), max-pooling y una capa lineal de clasificacion |
| Parametros totales | 115.716 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 200 caracteres (`max_len`); la entrada se trunca o se rellena a esa longitud |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como arrays NumPy sin cuantizar (466 KB) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`kit1_lite.npz`); vocabulario y metadatos en `kit1_lite_vocab.json` |
| Tarea (`pipeline_tag`) | `text-classification` |
| Etiquetas de salida | `safe`, `traversal`, `xss`, `sqli` |
| Libreria de inferencia | `numpy` (sin PyTorch ni frameworks de deep learning) |
| Tamano del repo | 0.0 GB (redondeado) |
| Descargas / likes en HuggingFace | 0 / 1 |
| Fecha de publicacion | 2026-10-18 |

## Arquitectura y entrenamiento

La arquitectura es una char-CNN compacta: cada caracter de la URL se proyecta a un embedding, cuatro kernels de convolucion de anchos 2, 3, 4 y 5 caracteres recorren la secuencia en paralelo, cada rama se agrega con max-pooling y una unica capa lineal produce los logits de las cuatro clases. La entrada se normaliza a 200 caracteres mediante truncado o padding. El modelo no emplea atencion, ni capas recurrentes, ni mecanismos de decodificacion; es un clasificador discriminativo de un solo paso.

Los datos de entrenamiento combinan, por un lado, aproximadamente 10.000 rutas de URL reales procedentes de sitios web ordinarios junto con casos benignos escritos a mano que suelen disparar falsos positivos en filtros simples (nombres con apostrofo como `O'Brien`, etiquetas HTML de formato como `<em>` o `<blockquote>`, simbolos matematicos con `<` y `>`). Por el lado de los ataques, se usan ejemplos de trafico real y payloads publicos de SecLists (MIT), PayloadsAllTheThings (MIT) y fuzzdb (CC BY 3.0) envueltos en rutas URL realistas. No se documenta el numero total de tokens ni el proceso de optimizacion (no hay mencion a RLHF ni DPO, algo esperable en un clasificador de este tamano).

El detalle metodologico mas relevante es la construccion del conjunto de test: se reservaron familias completas de ataques que no aparecen en entrenamiento, de modo que la evaluacion mide capacidad de generalizacion a variantes nuevas y no la memorizacion de duplicados cercanos.

## Capacidades

- Clasificacion de rutas URL en cuatro categorias cerradas: `safe`, `traversal` (path traversal tipo `../../etc/passwd`), `xss` (cross-site scripting) y `sqli` (inyeccion SQL).
- Salida con puntuaciones de confianza por clase (logits + softmax), lo que permite aplicar umbrales y descartar predicciones de baja seguridad.
- Inferencia en CPU pura con NumPy, sin dependencias de deep learning; el autor reporta unos 30 MB de RAM en su propia maquina.
- Ejecucion por linea de comandos con multiples URLs como argumentos, lectura desde fichero (`-f urls.txt`) o desde stdin.
- Integracion como funcion Python: `logits_one()`, `softmax()` y la constante `LABELS` desde `infer.py`.
- Deteccion robusta a confusiones habituales de filtros simples, al haber incluido en entrenamiento nombres con apostrofos y etiquetas HTML benignas como ejemplos `safe`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es exclusivamente un clasificador.
- Capacidad multilingue: no disponible; solo declara ingles y esta entrenado sobre rutas URL, que en la practica son mayoritariamente ASCII.

## Casos de uso

- **Senal adicional en el reverse proxy o en el API gateway:** enviar la ruta de cada peticion al clasificador y registrar la etiqueta y la confianza junto al log de acceso, para observar que tipos de payload llegan al servidor antes de decidir bloqueos.
- **Triaje de logs historicos:** pasar un fichero de rutas (`python3 infer.py -f urls.txt`) por el modelo para etiquetar trafico pasado y localizar intentos de traversal, XSS o SQLi que pasaron desapercibidos, con un coste de CPU minimo.
- **Generacion de reglas y firmas:** usar los falsos negativos y falsos positivos detectados en trafico propio para escribir reglas concretas en el WAF existente, en lugar de sustituirlo.
- **Testing de pipelines de seguridad:** emplear el modelo como oraculo rapido en pruebas automatizadas que verifican que un saneador de URLs o un middleware de validacion funciona como se espera.
- **Proteccion en entornos con recursos muy limitados:** dispositivos embebidos, funciones serverless con poca memoria o contenedores sin GPU donde no cabe un transformer, ya que el modelo ocupa 466 KB de pesos y no requiere PyTorch.
- **Etiquetado y enriquecimiento de datasets de seguridad:** clasificar grandes volumenes de rutas para construir corpus etiquetados de forma preliminar, que luego se revisan manualmente antes de usarse en entrenamiento.
- **Educacion y demos:** ilustrar en un taller como un modelo char-CNN separa payloads de peticiones legitimas, con inferencia reproducible en NumPy y sin infraestructura de GPU.

## Benchmarks y rendimiento

El autor solo publica resultados sobre su propio conjunto de test retenido, construido con familias de ataque no vistas en entrenamiento. No hay resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no realiza esas tareas.

| Metrica | Resultado |
|---|---|
| Accuracy (test retenido, familias no vistas) | 0,9989 |
| Macro F1 | 0,996 |
| Peticiones seguras marcadas erroneamente (falsos positivos) | 0,08 % |

Estas cifras proceden del conjunto de test del propio autor y no de un benchmark independiente; la model card advierte explicitamente de que el trafico real varia en cada sitio y de que deben validarse sobre datos propios antes de confiar en el modelo. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- **VRAM:** no requiere GPU. La inferencia se ejecuta en CPU con NumPy.
- **Memoria RAM:** aproximadamente 30 MB segun la medicion del autor (puede variar segun sistema operativo, version de Python y de NumPy).
- **Almacenamiento:** 466 KB de pesos (`kit1_lite.npz`) mas el vocabulario y el script de inferencia.
- **GPU recomendadas:** ninguna; no hay soporte de CUDA ni de aceleracion por hardware documentado.
- **Compatibilidad con GPU de consumo:** no aplica, el modelo ya cabe holgadamente en CPU.
- **Opciones de despliegue:** ejecucion directa de `infer.py` (argumentos, fichero o stdin) o importacion de sus funciones desde Python. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer y no usa formatos GGUF o safetensors.
- **Latencia y throughput:** no disponibles; no se publican mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos open-weight comparables de la misma categoria y tamano. La alternativa natural en produccion no es otro modelo, sino motores deterministas de reglas y firmas (WAF, expresiones regulares), cuyas especificaciones no se detallan aqui para no introducir datos no verificados.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| wardenfox/kit-1-lite | 115.716 | 200 caracteres | MIT | NumPy `.npz` | HuggingFace |
| Alternativas open-weight comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Es obligatorio decodificar antes de inferir.** El modelo esta entrenado sobre texto plano; ataques codificados como `%2e%2e%2f` pueden pasar sin ser detectados por diseno. Hay que normalizar y decodificar la URL previamente.
- **Solo cuatro clases.** No cubre inyeccion de comandos, SSRF, inclusion de ficheros locales, deserializacion insegura ni cualquier otra categoria fuera de `safe`, `traversal`, `xss` y `sqli`.
- **Casos limite documentados.** Expresiones matematicas con `<` o `>` sueltos y apostrofos aislados pueden producir respuestas erroneas con baja confianza; el autor recomienda usar la puntuacion de confianza como filtro.
- **No es un cortafuegos.** El propio autor lo describe como una senal adicional que debe convivir con la seguridad existente, no como sustituto de un WAF, de una auditoria o de asesoramiento profesional.
- **Riesgo de falsos positivos y negativos en trafico real.** El 0,08 % de falsos positivos se midio en su conjunto de test; en dominios con convenciones de URL propias (APIs REST con parametros en la ruta, IDs con caracteres especiales) la tasa puede diferir.
- **Limitacion de idioma y de formato.** Solo declara ingles y 200 caracteres de entrada; rutas mas largas se truncan, lo que puede eliminar la parte relevante del payload.
- **Sesgo de dominio.** El entrenamiento usa rutas de sitios web ordinarios; el rendimiento en trafico no HTTP (por ejemplo, rutas de sistema de ficheros o nombres de recursos cloud) no esta documentado.
- **Licencia permisiva con exencion de garantias.** MIT permite uso comercial, modificacion y redistribucion, pero el software se entrega "tal cual", sin garantia de idoneidad ni de cobertura de ataques. Parte de los datos de entrenamiento incluye fuzzdb bajo CC BY 3.0, por lo que conviene revisar `NOTICE` y `LICENSES/` si se redistribuye.
- **Madurez y trazabilidad.** 0 descargas y 1 like en el momento de la consulta, publicacion y actualizacion el mismo dia, sin paper ni evaluacion independiente; tratarlo como codigo experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wardenfox/kit-1-lite
- Sitio del autor (WardenFox): https://wardenfox.com
- SecLists (datos de entrenamiento, MIT): https://github.com/danielmiessler/SecLists
- PayloadsAllTheThings (datos de entrenamiento, MIT): https://github.com/swisskyrepo/PayloadsAllTheThings
- fuzzdb (datos de entrenamiento, CC BY 3.0): https://github.com/fuzzdb-project/fuzzdb
