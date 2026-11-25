# tranhaiduon/solana-mev-jito-arbitrage-bot

## Resumen

La ficha solicitada corresponde al identificador `tranhaiduon/solana-mev-jito-arbitrage-bot` alojado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: es un repositorio que distribuye un supuesto ejecutable de Windows (`solana-mev-jito-arbitrage-bot-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) presentado como bot de arbitraje MEV sobre Solana con integracion de Jito. No contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia.

El autor es el usuario `tranhaiduon`, con cero descargas y cero likes en el momento de la consulta, creado el 23 de noviembre de 2026 y actualizado el 24 de noviembre de 2026. La model card no describe ningun modelo de lenguaje: enumera supuestas capacidades de trading (enrutamiento de ordenes en menos de 40 ms, bundles de Jito, sandbox de paper-trading, copytrade de wallets) y ofrece un enlace de descarga alojado en un repositorio de GitHub de terceros (`whittaker627/solana-mev-jito-arbitrage-bot`) protegido con contrasena.

Por tanto, esta ficha documenta un artefacto que no es un modelo de IA. Todos los campos tecnicos propios de un modelo (arquitectura, parametros, contexto, cuantizacion, benchmarks) se marcan como no disponibles porque no existen. Se advierte de que el patron de distribucion (binario ejecutable, contrasena fija en el texto, enlace externo a GitHub, peticion de ejecutar como administrador y de desactivar avisos de SmartScreen) es caracteristico de campanas de malware, y no debe ejecutarse en ningun sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades del artefacto) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (se distribuye un `.exe` dentro de un `.zip` de 8,9 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable nativo de Windows de 64 bits, empaquetado en un ZIP de 8,9 MB con contrasena fija (`2026`), etiquetado como build `v1.2.6 (6A08CA)`. La model card menciona componentes internos del supuesto bot (motor de bundles Jito y MEV, enrutamiento por WebSocket y gRPC, bundler de 20 wallets mediante Lookup Tables, sandbox de paper-trading a 121 Hz, copytrade de wallets), pero no aporta ninguna documentacion tecnica verificable, codigo fuente ni artefactos de entrenamiento. No hay datos sobre tokens de entrenamiento, composicion del dataset, RLHF, DPO ni innovaciones de inferencia.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en modelos.
- Las unicas "capacidades" declaradas son funcionalidades de un supuesto bot de trading: arbitraje MEV, bundles de Jito, take-profit multinivel, copytrade de wallets y simulacion de paper-trading.
- No hay evidencia verificable de que dichas funcionalidades existan; la model card es el unico soporte y no incluye repositorio de codigo auditable.

## Casos de uso

- No procede. Al no ser un modelo de IA, no existen casos de uso legitimos de inferencia, generacion o analisis.
- El unico escenario descrito por el autor es la ejecucion de un bot de arbitraje en Solana; no es verificable y conlleva riesgo de seguridad.
- No se recomienda su uso en produccion, investigacion ni entornos de desarrollo.
- Cualquier integracion en pipelines de CI/CD, atencion al cliente o generacion de codigo es inaplicable.
- No debe emplearse como dependencia en proyectos de agentes ni de automatizacion.
- No debe ejecutarse en maquinas personales, servidores ni entornos con acceso a claves o wallets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo que inferir).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- El artefacto declara compatibilidad con Windows 10 (22H2) y Windows 11 (24H2) de 64 bits, con un consumo de RAM declarado inferior a 43 MB; estos datos provienen unicamente de la model card y no son verificables.
- Latencia y throughput: el autor declara enrutamiento de ordenes por debajo de 40 ms y sondeo a 121 Hz; no son verificables ni constituyen metricas de un modelo de IA.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se conocen comparativas verificables con otros bots de arbitraje MEV, ya que la informacion proporcionada no incluye alternativas auditadas.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Riesgo de seguridad alto: distribucion mediante ejecutable, contrasena fija en el texto, enlace de descarga alojado en un repositorio de GitHub de terceros y peticion explicita de ejecutar como administrador.
- La model card instruye a desactivar o ignorar avisos de Windows Defender y SmartScreen, lo que es un indicador clasico de software malicioso.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Sin codigo fuente ni auditoria: imposible verificar el comportamiento real del binario.
- Sin datos de sesgos ni alucinacion: no aplica, pero la ausencia de transparencia impide cualquier evaluacion de riesgos.
- La licencia MIT declarada no cubre responsabilidades sobre el contenido del ejecutable ni sobre posibles danos derivados de su uso.
- Riesgo financiero: cualquier supuesto bot de arbitraje MEV que solicite credenciales o claves de wallet puede provocar perdida de fondos.
- No debe ejecutarse en produccion, en maquinas con acceso a wallets, ni en entornos corporativos.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/tranhaiduon/solana-mev-jito-arbitrage-bot
- Repositorio de GitHub referenciado por el autor (descarga del binario): https://github.com/whittaker627/solana-mev-jito-arbitrage-bot
- Releases del repositorio referenciado: https://github.com/whittaker627/solana-mev-jito-arbitrage-bot/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion disponible.
