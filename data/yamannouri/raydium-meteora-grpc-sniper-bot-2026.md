# Yamannouri/raydium-meteora-grpc-sniper-bot-2026

## Resumen

La ficha solicitada corresponde al identificador de Hugging Face `Yamannouri/raydium-meteora-grpc-sniper-bot-2026`, publicado por el usuario Yamannouri el 24 de noviembre de 2026. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: es un paquete ejecutable para Windows x64 distribuido como supuesto bot de trading (sniper) para los protocolos Raydium y Meteora sobre la red Solana. El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia; los tags declarados son `windows`, `windows-11`, `x64`, `portable` y el propio nombre del bot.

El contenido de la model card no describe ninguna arquitectura de red neuronal, ningun conjunto de datos de entrenamiento ni ningun proceso de ajuste. En su lugar, presenta una tabla de "subsistemas" (boveda de claves AES-256, motor de bundles Jito/MEV, agrupador de 20 carteras mediante Lookup Tables, copia de smart money, filtro anti-honeypot y take profit multinivel) con metricas de latencia y "consistencia" no verificables, ademas de instrucciones para descargar un ZIP de 4,8 MB desde un repositorio de GitHub de terceros, extraerlo con contrasena `2026` y ejecutar un binario como administrador.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado y advierte de que no es evaluable como modelo de IA. No existen parametros, contexto, cuantizaciones ni benchmarks que reportar; cualquier uso del termino "modelo" en este contexto es un uso indebido de la plataforma de Hugging Face. La relevancia actual del artefacto es exclusivamente como caso de estudio de riesgo en la cadena de suministro de software: distribucion de ejecutables opacos con instrucciones de escalada de privilegios y promesas financieras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio no contiene ficheros de pesos en safetensors, GGUF, ONNX ni ningun otro formato de red neuronal, ni configuracion de transformer, MoE, SSM o hibrida. Tampoco hay tokenizador, plantilla de chat ni pipeline declarado (`Pipeline: no disponible`).

El contenido de la model card describe un supuesto programa de trading con modulos denominados "Local AES-256 Key Vault", "Jito & MEV Bundle Engine", "20-Wallet LUT Bundler", "Smart-Money Copytrade", "Pre-Buy Honeypot Filter" y "Multi-Tier Take Profit", con cifras de polling (273 Hz, 435 Hz) y tiempos de respuesta (< 15 ms) que no van acompanadas de metodologia, repositorio de codigo fuente ni artefactos reproducibles. El binario se distribuye fuera de Hugging Face, en un repositorio de GitHub de terceros (`pedrolong1343/dandys-world-forsaken-script-2026`), con nombre de fichero que no coincide con el del proyecto (`dandys-world-forsaken-script-2026-v1.2.2-win64.zip`), contrasena de extraccion fija (`2026`) y ejecucion recomendada como administrador. No hay informacion sobre datos de entrenamiento, RLHF, DPO ni innovacion tecnica alguna verificable.

## Capacidades

- No se ha documentado ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se ha documentado soporte de tool calling ni function calling en el sentido de modelos de lenguaje.
- No se ha documentado soporte de agentes ni razonamiento multi-paso basado en un modelo.
- El artefacto declara, sin evidencia reproducible, funcionalidades de trading automatizado: firma local de transacciones, envio de bundles, agrupacion de carteras mediante Lookup Tables, replicacion de carteras de terceros y filtros previos a la compra.
- Multilingue solo a nivel de metadatos del repositorio (14 codigos de idioma), sin artefacto linguistico asociado.

## Casos de uso

- Auditoria de seguridad y formacion: el paquete puede emplearse como muestra real de campana de distribucion de ejecutables opacos en plataformas de modelos, para entrenar a equipos en la deteccion de repositorios que suplantan la categoria "modelo" sin contener pesos ni pipeline.
- Analisis de cadena de suministro: estudiar como se encadenan un repositorio de Hugging Face, un repositorio de GitHub de terceros y un ZIP con contrasena para evadir analisis automatizados de malware.
- Investigacion sobre fraude financiero: documentar tecnicas de ingenieria social basadas en promesas de beneficios con bots de trading y en metricas inventadas (descargas, valoraciones, builds).
- Concienciacion de desarrolladores: ilustrar por que no debe ejecutarse como administrador un binario sin firma de codigo, sin hash publicado y sin codigo fuente auditable.
- Politicas de plataforma: servir de ejemplo para definir reglas de moderacion que distingan artefactos de IA de software ejecutable empaquetado.
- No se recomienda su uso operativo para trading, ni en produccion ni en pruebas con fondos reales, por ausencia total de garantias tecnicas y de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras presentes en la model card (273 Hz y 435 Hz de polling, < 15 ms de respuesta, 98,3 %, 98,4 % y 99,1 % de "consistencia") carecen de definicion de metrica, metodologia de medicion y conjunto de validacion, por lo que no son comparables ni verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no ejecuta un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 11 x64 (procesadores Intel y AMD x64), segun la model card.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes).
- Latencia y throughput: no disponibles de forma verificable; las cifras declaradas por el autor no aportan metodologia.
- Requisito declarado del paquete: 4,8 MB de tamano del ZIP y ejecucion como administrador.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoria de modelos de IA. Frente a modelos de lenguaje reales de la plataforma, la diferencia es categorica: ausencia de pesos, de arquitectura, de tokenizador, de pipeline y de evaluacion.

| Criterio | Este artefacto | Modelo de IA tipico en HF |
|---|---|---|
| Pesos publicados | No | Si (safetensors, GGUF, etc.) |
| Arquitectura declarada | No | Si |
| Pipeline | No disponible | Definido (text-generation, etc.) |
| Evaluacion reproducible | No | Habitual (benchmarks publicados) |
| Codigo fuente auditable | No | Frecuente |
| Ejecutable binario | Si (`.exe` externo) | No habitual |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje; la ficha se limita a documentar el artefacto publicado.
- Distribucion de un ejecutable (`.exe`) fuera de Hugging Face, en un repositorio de GitHub de terceros cuyo nombre no coincide con el del proyecto, lo que impide verificar autoria y procedencia.
- Instrucciones explicitas de ejecutar como administrador en Windows, lo que amplia el impacto de cualquier codigo malicioso.
- ZIP protegido con contrasena fija (`2026`), practica habitual para dificultar el analisis automatizado por parte de antivirus y escaneres.
- Ausencia de firma de codigo, hashes publicados, codigo fuente o compilacion reproducible.
- Metricas de rendimiento y de "consistencia" sin metodologia; insignias de descargas y valoracion no verificables.
- Riesgo financiero directo: un bot de trading con acceso a claves privadas puede provocar perdida total de fondos, ademas de riesgos de robo de claves si el binario es malicioso.
- Posible incumplimiento de las condiciones de uso de la plataforma al publicar software ejecutable en un repositorio de modelos.
- La licencia MIT declarada en los metadatos no acompana a ningun fichero de licencia verificable ni a codigo fuente; su aplicabilidad al binario es dudosa.
- No debe desplegarse en produccion ni en entornos con credenciales o carteras reales bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yamannouri/raydium-meteora-grpc-sniper-bot-2026
- Repositorio de GitHub referenciado en la model card: https://github.com/pedrolong1343/dandys-world-forsaken-script-2026
- Release referenciada en la model card: https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Repositorio alternativo citado en la model card: https://github.com/bettysuzuki/raydium-meteora-grpc-sniper-bot-2026/releases/latest
- Paper, blog o demo del autor: no disponible.
