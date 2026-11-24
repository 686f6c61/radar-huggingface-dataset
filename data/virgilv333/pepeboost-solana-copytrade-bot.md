# virgilv333/pepeboost-solana-copytrade-bot

## Resumen

`virgilv333/pepeboost-solana-copytrade-bot` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable portable para Windows (build `v4.3.8`, identificador `E24EAF`) presentado como bot de copytrading sobre la blockchain de Solana. El artefacto anunciado es un archivo ZIP de 4,8 MB (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip`) protegido con la contraseña `2026`, que contiene un binario `.exe` orientado a Windows 10 y Windows 11 en arquitectura x64.

La model card no describe ninguna arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia: el campo `pipeline` de Hugging Face aparece como no disponible y no existe ningún dato de parámetros, contexto o entrenamiento. Los contenidos declarados (copytrading de smart money, take profit multinivel, bundles Jito/MEV, bundler de 20 wallets con Lookup Tables, sandbox de paper trading y almacén local AES-256) corresponden a funcionalidades de un presunto bot de trading, no a capacidades de un modelo lingüístico.

Por tanto, esta ficha documenta el repositorio como lo que es: un artefacto binario empaquetado con fines presuntamente financieros, con cero descargas y cero likes en el momento de la consulta, y con múltiples señales de riesgo (ejecutable sin firma, contraseña de extracción en la propia página, enlaces de descarga que apuntan a repositorios de GitHub ajenos al autor declarado y a un nombre de archivo que no coincide con el del proyecto). No debe confundirse con un modelo de IA open source ni evaluarse como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio no contiene pesos, ficheros `safetensors`, `GGUF` ni configuración de modelo. La model card describe módulos funcionales de un supuesto bot de trading —motor de copytrading, gestión de take profit, bundles Jito/MEV, bundler de wallets mediante Lookup Tables, sandbox de simulación y almacén de claves AES-256— sin especificar lenguaje de implementación, dependencias, binarios intermedios ni mecanismo de firma de transacciones verificable.

El único artefacto técnico concreto es un ejecutable Windows x64 de 4,8 MB comprimido, con build declarada `v4.3.8 (E24EAF)`. No se aporta hash, firma de código, repositorio de código fuente ni proceso de compilación reproducible, lo que impide cualquier auditoría técnica del binario.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión, por tratarse de un binario y no de un modelo lingüístico.
- No se documenta soporte de *tool calling* ni *function calling* en el sentido de un LLM.
- No se documenta razonamiento multi-paso ni comportamiento de agente conversacional.
- El repositorio declara soporte de 14 idiomas en sus metadatos, sin especificar si se refiere a la interfaz del ejecutable o a documentación.
- Funcionalidades declaradas por el autor (no verificadas): copytrading de wallets de smart money, take profit multinivel con trailing stop, bundles Jito/MEV con tip dinámico, ejecución multi-wallet en el mismo bloque mediante Lookup Tables, sandbox de paper trading y almacén local de claves AES-256.
- No se aporta ninguna evidencia de que estas funcionalidades existan en el binario distribuido.

## Casos de uso

- Auditoría de seguridad de artefactos en Hugging Face: el repositorio sirve como caso de estudio de distribución de binarios no auditados bajo apariencia de proyecto open source, útil para equipos que definan políticas de ingesta de artefactos.
- Formación en detección de ingeniería social: la model card emplea insignias falsas de descargas y valoraciones, contraseña de extracción embebida y enlaces a repositorios de GitHub de terceros, un patrón reconocible en campañas de malware.
- Análisis de ecosistema de bots de trading en Solana: permite estudiar cómo se comercializan este tipo de herramientas y qué funcionalidades prometen, sin ejecutar el binario.
- Investigación sobre cadena de suministro de software: ejemplo de discrepancia entre el nombre del proyecto (`pepeboost-solana-copytrade-bot`) y el del artefacto (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip`), señal típica de reempaquetado.
- Documentación de riesgos para comunidades de cripto: material para advertir a usuarios sobre la descarga de ejecutables con contraseña fija y solicitud de ejecución como administrador.
- No se recomienda ningún caso de uso que implique ejecutar el binario en un entorno con claves, wallets o fondos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento verificables; las cifras que aparecen en la model card (menos de 32 MB de RAM, menos de 17 ms de respuesta, 6, 14 y 9 hilos de trabajo) son afirmaciones del autor sin metodología ni evidencia adjunta.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11, arquitectura x64 (según la model card).
- VRAM: no aplica; no es un modelo de IA y no requiere GPU.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue: no disponibles; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Memoria RAM declarada por el autor: menos de 32 MB (no verificado).
- Latencia y throughput: el autor afirma menos de 17 ms de respuesta (no verificado, sin metodología).
- Tamaño del artefacto: 4,8 MB comprimido.
- Requiere extracción con contraseña `2026` y ejecución como administrador según las instrucciones del autor.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Como referencia de categoría, se compara con otros tipos de artefacto:

| Criterio | pepeboost-solana-copytrade-bot | Modelo LLM open source típico | Bot de trading open source auditado |
|---|---|---|---|
| Naturaleza | Binario Windows x64 | Pesos + código | Código fuente auditable |
| Pesos publicados | No | Sí (safetensors/GGUF) | No aplica |
| Código fuente | No disponible | Habitualmente sí | Sí, en repositorio público |
| Firma de código | No documentada | No aplica | Habitualmente sí |
| Reproducibilidad | Nula | Alta | Alta |
| Licencia | MIT (declarada) | MIT/Apache-2.0/etc. | MIT/Apache-2.0/etc. |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como modelo lingüístico.
- Ejecutable sin firma de código, sin hash publicado y sin código fuente: imposible verificar qué contiene el binario.
- Distribución mediante ZIP protegido con contraseña fija (`2026`) y solicitud de ejecución como administrador: patrón habitual para evadir análisis automáticos de antivirus y SmartScreen.
- Los enlaces de descarga apuntan a repositorios de GitHub (`YokoCastro3813/...`, `heatherray496/...`) distintos del autor declarado en Hugging Face (`virgilv333`), lo que sugiere reempaquetado o suplantación.
- El nombre del artefacto (`fisch-script-auto-catch-macro-2026-...`) no guarda relación con el proyecto anunciado, indicio de reutilización de una plantilla de malware o de otro producto.
- Insignias de descargas (254K+) y valoración (5,0/5) en la model card son estáticas y no verificables; el repositorio registra 0 descargas y 0 likes en Hugging Face.
- Riesgo de robo de claves privadas: el autor declara un "almacén local AES-256" sin especificar implementación, lo que en un binario opaco podría exfiltrar claves.
- Riesgo de pérdida de fondos: cualquier operación de trading ejecutada por un binario no auditado puede firmar transacciones maliciosas.
- La licencia MIT declarada no otorga ninguna garantía sobre el contenido ni la seguridad del binario.
- No debe ejecutarse en máquinas con wallets, credenciales o fondos. Si se analiza, hacerlo en una máquina virtual aislada y sin red.
- No se han identificado sesgos de modelo porque no hay modelo; el riesgo es de seguridad, no de calidad de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/virgilv333/pepeboost-solana-copytrade-bot
- Enlace de descarga citado en la model card (repositorio de terceros, no verificado): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (repositorio de terceros, no verificado): https://github.com/heatherray496/pepeboost-solana-copytrade-bot/releases/latest
- Paper: no disponible
- Blog o documentación oficial: no disponible
- Repositorio de código fuente: no disponible
- Demo: no disponible
