# truongxoantit/bybit-binance-perp-copytrade-bot-portable

## Resumen

La ficha solicitada corresponde al identificador `truongxoantit/bybit-binance-perp-copytrade-bot-portable`, alojado en Hugging Face. Tras revisar la informacion disponible, se concluye que **no se trata de un modelo de inteligencia artificial** ni de un artefacto de aprendizaje automatico. No existe pipeline declarado, no hay pesos, no hay arquitectura de red neuronal y no se publican parametros, contexto ni datos de entrenamiento. El contenido del repositorio es un paquete ejecutable portable para Windows orientado a la operativa de copytrading en futuros perpetuos de Bybit y Binance.

El autor, `truongxoantit`, distribuye un binario denominado `schedule-1-cheat-trainer-v1.2.2-win64.exe` dentro de un archivo ZIP de 4,8 MB protegido con contrasena. La model card describe funcionalidades de enrutamiento de ordenes, bundles MEV, copia de wallets y sandbox de paper trading, ademas de enlaces de descarga que apuntan a un repositorio de GitHub de terceros (`arjunzimmermann624/schedule-1-cheat-trainer`). No hay evidencia de componente de IA generativa ni de inferencia de modelos.

Por tanto, esta ficha no puede cumplir la estructura tecnica habitual de un modelo (arquitectura, parametros, benchmarks) porque esos datos sencillamente no existen. Se documenta lo que el autor declara, se senalan las incongruencias y se advierte de los riesgos de seguridad asociados a la ejecucion de binarios de procedencia no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable portable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun etiquetas del autor) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion como `.zip` con un `.exe` Win64) |
| Plataforma objetivo | Windows 10 y Windows 11 (64 bits) |
| Build declarada | v2.8.7 (D18365) |
| Tamano del artefacto | 4,8 MB (ZIP), contrasena `2026` |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni codigo de entrenamiento. La model card describe un conjunto de modulos de ejecucion (multi-tier take profit, motor de bundles Jito/MEV, enrutamiento de ordenes sub-40 ms, bundler de 20 wallets con Lookup Tables, sandbox de paper trading y copytrading de smart money) presentados como caracteristicas de un binario, no como capacidades de un modelo neuronal.

No se documenta dataset, numero de tokens, proceso de RLHF/DPO ni innovacion algorítmica alguna. Las cifras que aparecen en la model card (172 Hz, 388 Hz, 99,4 % de consistencia, < 24 ms) son afirmaciones del autor sin metodologia de medicion ni evidencia reproducible. Ademas, el contenido mezcla elementos de ecosistemas incompatibles: menciona Jito y MEV bundles, propios de Solana, en un producto que se presenta como bot para Bybit y Binance en futuros perpetuos.

## Capacidades

- No se trata de un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en IA.
- Las capacidades declaradas son operativas de trading: copia de wallets, escalado de take profit, enrutamiento de ordenes y simulacion en sandbox.
- El etiquetado multilingue (14 idiomas) parece referirse a la localizacion de la interfaz o de la documentacion, no a capacidades linguisticas de un modelo.

## Casos de uso

No es posible recomendar casos de uso legitimos de este artefacto como modelo de IA, porque no lo es. Los escenarios que el autor sugiere son los siguientes, con las advertencias correspondientes:

- Copytrading de wallets de smart money en futuros perpetuos: el autor afirma que el binario replica posiciones de wallets seleccionadas con dimensionamiento proporcional. No hay verificacion independiente de que funcione ni de que sea seguro.
- Simulacion de estrategias en paper trading: se presenta un sandbox contra libros de ordenes en vivo. La ausencia de codigo auditable impide validar la fidelidad de la simulacion.
- Gestion automatizada de take profit por niveles: escalado de objetivos y trailing stop. Riesgo alto si el binario opera con claves reales.
- Enrutamiento de ordenes de baja latencia: el autor declara streaming por WebSocket y gRPC. No hay benchmarks reproducibles.
- Bundling multi-wallet: ejecucion de varias wallets en el mismo bloque mediante Lookup Tables. Esta funcionalidad es propia de Solana y resulta incongruente con el supuesto enfoque en Bybit y Binance.
- Distribucion portable para Windows: el interes practico declarado es no requerir instalacion. Esta comodidad es precisamente lo que eleva el riesgo de seguridad.

En ningun caso se recomienda su ejecucion en entornos con credenciales reales de exchange.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas son afirmaciones de marketing de la model card (172 Hz, 388 Hz, 99,4 %, < 24 ms, sub-40 ms) sin metodologia, hardware de referencia ni reproducibilidad. No se incluyen tablas comparativas con otros modelos porque no existe modelo comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Plataforma de ejecucion declarada: Windows 10/11 de 64 bits, ejecucion como administrador del binario `schedule-1-cheat-trainer-v1.2.2-win64.exe`.
- Latencia y throughput: solo cifras del autor, no verificadas.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos de IA comparable porque el artefacto no es un modelo. Frente a herramientas de trading automatizado, la comparacion no puede establecerse con rigor al no haber codigo fuente auditable, documentacion tecnica verificable ni resultados reproducibles.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha se incluye por completitud, pero su naturaleza es la de un binario de terceros.
- Riesgo de seguridad elevado: se distribuye un `.exe` dentro de un ZIP protegido con contrasena, alojado en un repositorio de GitHub distinto del declarado en Hugging Face, lo que impide verificar la cadena de custodia.
- Incoherencias tecnicas: mezcla componentes de Solana (Jito, MEV bundles, Lookup Tables) con un supuesto bot para Bybit y Binance en perpetuos.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, frente a las "173K+" descargas que afirma la model card: discrepancia no explicada.
- Ausencia de pipeline, pesos y codigo fuente: no es auditable ni reproducible.
- Riesgo de phishing o malware: los patrones de la model card (contrasena fija, enlaces a repositorios de terceros, insignias de descargas infladas) son habituales en campanas de distribucion de software malicioso.
- Riesgo financiero: ejecutar un binario no auditado con claves de API de exchange puede derivar en perdida de fondos.
- Licencia MIT declarada, pero sin archivo LICENSE verificable en la informacion proporcionada; la licencia no subsana los riesgos anteriores.
- No usar en produccion bajo ninguna circunstancia sin auditoria forense previa del binario.

## Enlaces

- Hugging Face: https://huggingface.co/truongxoantit/bybit-binance-perp-copytrade-bot-portable
- Repositorio citado en la model card (terceros): https://github.com/niklash13/bybit-binance-perp-copytrade-bot-portable
- Enlace de descarga referenciado (terceros, no verificado): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Paper, blog o demo oficiales: no disponible
