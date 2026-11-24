# zrbobozrx/bybit-binance-perp-copytrade-bot-v3

## Resumen

`zrbobozrx/bybit-binance-perp-copytrade-bot-v3` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable portable para Windows (build `v4.5.3`, identificador `9F08FE`), empaquetado en un archivo ZIP de 8,9 MB protegido con contraseña (`2026`) y alojado en un repositorio de GitHub de terceros (`sharonf35/bybit-binance-perp-copytrade-bot-v3`). El contenido se presenta como un bot de copytrading de perpetuos para Bybit y Binance, con módulos de bundling multi-cartera, motor de bundles Jito/MEV, filtro de honeypots y bóveda local de claves AES-256.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni tarjeta de modelo en el sentido habitual: la model card es en realidad una página de descarga con insignias, contraseñas de descompresión e instrucciones para ejecutar un binario como administrador. No hay pipeline declarado (`no disponible`), cero descargas y cero likes en el momento de la consulta.

Desde la perspectiva de evaluación de modelos, este artefacto queda fuera de la categoría: no permite inferencia de lenguaje, no expone parámetros, contexto ni cuantizaciones, y su naturaleza (binario cerrado distribuido vía ZIP con contraseña desde un repositorio no oficial) constituye una señal de riesgo de seguridad relevante. La ficha se completa a continuación manteniendo la estructura solicitada y marcando como "no disponible" todos los campos técnicos que no aplican o no pueden verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución en ZIP `bybit-binance-perp-copytrade-bot-v3-v1.2.0-win64.zip`, 8,9 MB, con contraseña `2026`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El artefacto declarado es un ejecutable Windows x64 (`bybit-binance-perp-copytrade-bot-v3-v1.2.0-win64.exe`) que, según la model card, implementa módulos de trading: un bundler de 20 carteras con Lookup Tables, un motor de bundles Jito/MEV con dimensionado dinámico de propinas, un espejo de carteras "smart-money", un filtro pre-compra de honeypots, un sandbox de paper trading y una bóveda local de claves AES-256. Estos datos provienen exclusivamente del texto promocional del autor y no han sido verificados de forma independiente.

No se especifican tokens de entrenamiento, composición de dataset, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia, porque no aplican. Tampoco se documenta el lenguaje de implementación, las dependencias, la cadena de compilación ni la firma de código del binario.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) corresponden a los idiomas de la documentación del repositorio, no a capacidades del artefacto.
- Capacidades declaradas por el autor, no verificadas: copytrading de perpetuos entre Bybit y Binance, bundling multi-cartera en el mismo bloque, bundles Jito/MEV, filtrado de honeypots, paper trading y almacenamiento local de claves.
- No se documenta thinking mode, visión, audio ni ninguna capacidad cognitiva.

## Casos de uso

- Evaluación de riesgos de cadena de suministro: un equipo de seguridad puede usar este repositorio como caso de estudio de binarios distribuidos con contraseña desde repositorios no oficiales, analizando el ZIP en un entorno aislado (sandbox, VM sin red) antes de cualquier ejecución.
- Investigación de malware y phishing financiero: el patrón (insignias de descargas infladas, contraseña en la propia página, enlace a un repositorio de GitHub ajeno al autor original) es representativo de campañas de distribución de software potencialmente no deseado; sirve como muestra para formación de analistas.
- Concienciación de usuarios en entornos de trading: permite ilustrar por qué no deben ejecutarse ejecutables de "bots de trading gratuitos" como administrador en máquinas con acceso a claves de exchange.
- Documentación de taxonomía en catálogos internos de Hugging Face: útil para clasificar artefactos que no son modelos y evitar que se indexen como tales en pipelines de descubrimiento de modelos.
- Pruebas de políticas de ingesta: un equipo de MLOps puede validar que sus filtros rechazan repositorios sin pesos, sin pipeline y con enlaces de descarga externos.
- Formación en higiene operativa: ejemplo práctico de por qué conviene verificar licencia, autoría, firma del binario y reputación del repositorio antes de descomprimir archivos protegidos con contraseña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de inferencia, y las cifras que aparecen en la model card (descargas, valoración, latencias en milisegundos, consumo de RAM) son afirmaciones promocionales del autor sin metodología ni verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 (22H2) y Windows 11 (24H2) sobre procesadores x64 Intel y AMD.
- Opciones de despliegue: ejecución del binario `bybit-binance-perp-copytrade-bot-v3-v1.2.0-win64.exe` como administrador, previa extracción del ZIP con contraseña `2026`. No se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de la model card (menos de 10 ms, 363 Hz de sondeo, menos de 31 MB de RAM) no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Frente a otros repositorios de Hugging Face, la diferencia cualitativa es que estos publican pesos (safetensors, GGUF), configuración y tokenizador, mientras que este publica un enlace de descarga externo a un binario cerrado.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de lenguaje, razonamiento o código.
- Distribución mediante ZIP con contraseña (`2026`) y enlace a un repositorio de GitHub de un tercero (`sharonf35`) distinto del autor del repositorio de Hugging Face: patrón habitual en campañas de distribución de software no verificado.
- Ejecución solicitada "como administrador": eleva privilegios del binario sobre el sistema, lo que amplifica el impacto de cualquier comportamiento malicioso.
- El binario se presenta como bot de trading con acceso a claves de exchange; una bóveda AES-256 local no garantiza que las claves no se exfiltren si el ejecutable es malicioso.
- Cero descargas y cero likes en el momento de la consulta, frente a las "642K+" descargas que afirma la model card: discrepancia que sugiere marketing engañoso.
- Licencia MIT declarada, pero sin código fuente publicado que permita verificar su cumplimiento ni auditar el binario.
- Riesgo de alucinación: no aplica; riesgo real de fraude financiero y robo de credenciales si se ejecuta en un equipo con acceso a exchanges.
- No debe desplegarse en producción ni en máquinas con carteras activas. Cualquier análisis debe hacerse en una VM aislada, sin red y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zrbobozrx/bybit-binance-perp-copytrade-bot-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/sharonf35/bybit-binance-perp-copytrade-bot-v3
- Enlace de descarga del ZIP citado en la model card: https://github.com/sharonf35/bybit-binance-perp-copytrade-bot-v3/releases/latest/download/bybit-binance-perp-copytrade-bot-v3-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/sharonf35/bybit-binance-perp-copytrade-bot-v3/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
