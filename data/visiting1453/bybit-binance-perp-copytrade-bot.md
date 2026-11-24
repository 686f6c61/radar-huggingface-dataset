# visiting1453/bybit-binance-perp-copytrade-bot

## Resumen

El artefacto publicado bajo el identificador `visiting1453/bybit-binance-perp-copytrade-bot` no es un modelo de inteligencia artificial, sino un supuesto binario portable para Windows de 64 bits distribuido a través de Hugging Face. La model card describe una herramienta de copy trading para futuros perpetuos en Bybit y Binance, empaquetada como un archivo ZIP de 8,9 MB con un ejecutable `bybit-binance-perp-copytrade-bot-v1.2.0-win64.exe` protegido por la contraseña `2026`. No se declara arquitectura neuronal, parámetros, tokenizador, pesos ni pipeline de inferencia.

La ficha se redacta por rigor documental: el recurso aparece indexado en Hugging Face con etiquetas de modelo (`language`, `license:mit`, `region:us`), pero su contenido es un ejecutable de terceros. Los datos técnicos propios de un modelo (arquitectura, contexto, cuantización, benchmarks) no están disponibles porque no existen: el artefacto no entrena ni infiere lenguaje.

El interés práctico es nulo para desarrolladores e investigadores de IA. El riesgo es alto: un binario opaco, alojado en un repositorio sin descargas ni interacciones, que solicita ejecución como administrador y maneja claves de intercambios. Se documenta aquí como advertencia y para que los sistemas de catalogación no lo confundan con un modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El artefacto es un ejecutable compilado para Windows 10/11 de 64 bits, con build declarada `v1.2.2 (69E0EF)` y firma `69E0EF6AFC` según el manifiesto TOML de la model card. El autor afirma funcionalidades de routing de órdenes por WebSocket y gRPC, bóveda local AES-256 y un «bundler» de 20 wallets mediante Lookup Tables, pero no se aporta código fuente, hash verificable ni reproducible build.

No se documentan datos de entrenamiento, tokens, composición de dataset, RLHF, DPO ni ninguna técnica de aprendizaje. Tampoco hay información sobre el proceso de compilación, dependencias o cadena de suministro del binario.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No tiene modo de razonamiento, thinking mode, audio ni multimodalidad.
- El autor declara, sin verificación independiente, funciones de simulación paper-trade, filtro «honeypot», take profit multinivel, routing de órdenes con latencia declarada inferior a 40 ms, bóveda local de claves AES-256 y ejecución multi-wallet.
- Los idiomas listados en metadatos corresponden a la ficha del repositorio, no a capacidades lingüísticas del artefacto.

## Casos de uso

- Catalogación y triaje: identificar que el recurso etiquetado como modelo es en realidad un binario y excluirlo de pipelines de evaluación de LLM.
- Auditoría de seguridad: analizar el ejecutable en un entorno aislado (sandbox, VM sin red) antes de cualquier uso, dado que solicita privilegios de administrador.
- Formación en higiene de cadena de suministro: usar el caso como ejemplo de publicación de binarios opacos en plataformas de modelos.
- Investigación sobre spam y abuso en Hugging Face: estudiar patrones de repositorios con nombres de bots de trading y contraseñas en la model card.
- Análisis de malware: someter el ZIP a motores de detección y análisis dinámico para caracterizar su comportamiento.
- Documentación de riesgos: incorporar el caso a guías internas sobre descarga de ejecutables desde plataformas no orientadas a binarios.

No se recomienda ningún uso operativo del binario para trading real: no hay auditoría, ni reputación, ni verificación de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (latencia inferior a 29 ms, 98,3 % de consistencia, 99,1 % de consistencia, rating 4,9/5, 397K descargas) son afirmaciones del autor sin metodología, sin conjunto de prueba y sin verificación independiente; no deben tratarse como benchmarks.

## Requisitos de hardware

- Plataforma declarada: Windows 10 u 11 de 64 bits.
- Espacio en disco: archivo ZIP de 8,9 MB; tamaño descomprimido no disponible.
- VRAM: no aplica (no hay inferencia neuronal).
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes).
- Latencia y throughput: no disponibles; las cifras del autor carecen de respaldo.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a herramientas legítimas de trading algorítmico (por ejemplo, frameworks open source de ejecución de órdenes), la diferencia clave es que aquí no hay código fuente auditable ni repositorio público verificable.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y pipeline; cualquier evaluación como LLM es inválida.
- Binario opaco distribuido con contraseña (`2026`) y ejecución como administrador: superficie de riesgo elevada.
- Manejo declarado de claves de intercambios y firma local: un binario no auditado podría exfiltrar credenciales o fondos.
- Licencia MIT declarada en metadatos, pero sin archivo LICENSE verificable ni código fuente asociado; el uso comercial no está garantizado por la mera etiqueta.
- Cero descargas y cero likes en el momento del registro: sin señal de reputación.
- Fecha de creación y actualización (2026-11-24) y métricas infladas en la model card (397K descargas, rating 4,9/5) no son verificables y resultan inconsistentes con el estado del repositorio.
- Riesgo de suplantación de marca (Bybit, Binance) y de ingeniería social; no hay afiliación demostrada con ninguno de los exchanges.
- No usar en producción ni con fondos reales sin auditoría independiente del binario y revisión legal.

## Enlaces

- Hugging Face: https://huggingface.co/visiting1453/bybit-binance-perp-copytrade-bot
- Repositorio citado en la model card: https://github.com/rogers77795/bybit-binance-perp-copytrade-bot
- Releases citadas: https://github.com/rogers77795/bybit-binance-perp-copytrade-bot/releases/latest
- Paper, blog o demo: no disponibles.
