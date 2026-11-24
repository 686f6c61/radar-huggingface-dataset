# visiting1453/gmgn-bullx-photon-copytrade-bot-portable

## Resumen

`visiting1453/gmgn-bullx-photon-copytrade-bot-portable` no es un modelo de lenguaje. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable portable para Windows 10 y Windows 11 (x64) distribuido como archivo ZIP de 8,9 MB, presentado por su autor como un bot de copytrading para plataformas de trading de criptomonedas (GMGN, Bullx y Photon). El artefacto se publica con licencia MIT y metadatos multilingües (14 idiomas declarados), pero carece de pipeline, pesos, tokenizador, configuración o cualquier componente propio de un modelo de IA.

La ficha se redacta, por tanto, como evaluación técnica del artefacto publicado, no de un modelo. No existe arquitectura neuronal, parámetros, ventana de contexto ni proceso de entrenamiento que describir: el repositorio contiene un binario cerrado, una contraseña de descompresión fija (`2026`) y una model card con marcado promocional y enlaces de descarga alojados en un repositorio de GitHub de terceros. Es relevante ahora únicamente como caso de estudio de contenido que se hace pasar por modelo en el Hub y de los riesgos asociados a ejecutar binarios de procedencia no verificada.

Cualquier uso previsto de este artefacto debe abordarse con cautela extrema: un ejecutable de trading que solicita claves privadas o semillas, que se ejecuta «como administrador» y que se distribuye con contraseña de archivo es un patrón habitual de malware o de fraude financiero. No se recomienda su descarga ni ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; sin verificación funcional) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto distribuido como `.zip` con un `.exe` en su interior) |

Datos adicionales del artefacto, según la model card: tamaño del paquete 8,9 MB, build declarada `v2.1.6 (5C0BE2)`, contraseña de descompresión `2026`, plataforma objetivo Windows 10/11 de 64 bits, y descargas y likes en el Hub iguales a 0 en el momento de la consulta.

## Arquitectura y entrenamiento

No aplica. No hay transformer, MoE, SSM ni arquitectura híbrida; no hay dataset, número de tokens, RLHF, DPO ni ninguna fase de entrenamiento documentada. El repositorio no incluye `config.json`, `tokenizer.json`, ficheros `safetensors` ni `GGUF`. La única información técnica disponible es la descripción funcional del binario que hace el autor en la model card: motor de bundles Jito/MEV, enrutado de órdenes por WebSocket y gRPC, bóveda local de claves AES-256, filtro de honeypots previo a la compra y sandbox de paper trading. Estas afirmaciones no vienen acompañadas de código fuente, hashes verificables ni auditoría alguna, por lo que no pueden considerarse contrastadas.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento, visión, audio ni multimodalidad.
- El autor declara funcionalidades de trading automatizado: copytrading, take profit multinivel, trailing stop, simulación de paper trading, bundles Jito/MEV, enrutado de órdenes de baja latencia y filtro de honeypots.
- El autor declara gestión local de claves con AES-256 y firma no custodial.
- Los idiomas listados en los metadatos son etiquetas del repositorio, no capacidades lingüísticas verificadas de ningún componente.

## Casos de uso

No se identifican casos de uso legítimos y verificables para este artefacto en el contexto de evaluación de modelos de IA. Los escenarios que se enumeran a continuación describen lo que el autor afirma que hace el binario, junto con la advertencia correspondiente:

- Automatización de copytrading en DEX: el autor indica que el bot replica operaciones de carteras de referencia; no hay evidencia independiente de que funcione ni de que sea seguro ejecutarlo con fondos reales.
- Gestión de salidas con take profit escalonado y trailing stop: funcionalidad declarada, sin código ni auditoría que la respalde.
- Simulación de estrategias en paper trading: el autor describe un sandbox contra libros de órdenes en vivo; útil en teoría para validar estrategias sin riesgo, pero el binario no es auditable.
- Ejecución de bundles Jito/MEV en Solana: funcionalidad declarada; implica firma de transacciones y manejo de claves, con riesgo elevado si el binario es malicioso.
- Filtrado de tokens fraudulentos (honeypots, autoridades de mint/freeze, bloqueo de liquidez): declarado por el autor, no verificable.
- Estudio de caso de seguridad: el repositorio sirve como ejemplo didáctico de patrón sospechoso (ZIP con contraseña, EXE que pide ejecución como administrador, enlaces de descarga fuera del Hub, cero descargas y cero likes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (latencia inferior a 36 ms en enrutado, 99,3 % de consistencia, consumo menor de 39 MB de RAM) son afirmaciones del autor sin metodología, sin conjunto de prueba y sin reproducibilidad, por lo que no se recogen como resultados medidos.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- CPU y sistema operativo: Windows 10 o Windows 11 de 64 bits, según el autor.
- Almacenamiento: 8,9 MB para el ZIP; el espacio descomprimido no se especifica.
- Opciones de despliegue: ejecución directa del `.exe` en Windows; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe una categoría de «modelos» comparable: este repositorio no es un modelo de IA. Frente a modelos reales de trading o de análisis financiero (por ejemplo, modelos de series temporales o LLM con herramientas financieras), la comparación carece de sentido porque aquí no hay pesos, arquitectura ni evaluación. Frente a otros artefactos del Hub con características similares (binarios empaquetados con contraseña y promesas de rentabilidad), la comparación relevante es de señales de riesgo, no de rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, integrarse ni citarse como tal en comparativas de LLM.
- Riesgo de seguridad elevado: ejecutable cerrado, distribuido en ZIP protegido con contraseña (`2026`) y con instrucciones de ejecución como administrador; patrón compatible con malware, stealers de claves o fraude financiero.
- Enlaces de descarga alojados en un repositorio de GitHub de terceros, no en el propio Hub; el contenido puede cambiar sin trazabilidad.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Afirmaciones de rendimiento (latencias, consistencia, consumo) sin metodología ni auditoría.
- Cualquier uso con claves privadas o fondos reales implica riesgo de pérdida total del capital.
- Licencia MIT declarada, pero la licencia no otorga ninguna garantía sobre el comportamiento del binario.
- Idiomas declarados en los metadatos sin verificación funcional.
- Alucinación y sesgos: no aplica en el sentido de un LLM, pero la model card contiene afirmaciones no verificables que funcionan como marketing.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/visiting1453/gmgn-bullx-photon-copytrade-bot-portable
- Repositorio GitHub referenciado por el autor (descarga del ZIP): https://github.com/gchaudhry35057/gmgn-bullx-photon-copytrade-bot-portable/releases/latest
- Paper, blog o demo oficiales: no disponible
