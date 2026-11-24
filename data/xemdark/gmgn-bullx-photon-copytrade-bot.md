# Xemdark/gmgn-bullx-photon-copytrade-bot

## Resumen

La ficha solicitada corresponde a `Xemdark/gmgn-bullx-photon-copytrade-bot`, un repositorio alojado en Hugging Face que **no contiene un modelo de IA**. Se trata de un artefacto empaquetado como ejecutable portable para Windows 10/11 (x64), distribuido mediante un archivo ZIP de 4,8 MB (`solara-executor-v3-keyless-v1.2.2-win64.zip`) protegido con contrasena. El contenido del README se limita a instrucciones de descarga, descompresion y ejecucion de un binario (`solara-executor-v3-keyless-v1.2.2-win64.exe`, build `v1.7.5` / `1B23EE`), junto con una tabla de "modulos" que describe funcionalidades de copytrading de criptomonedas (sandbox de paper-trading, mirroring de wallets, filtro de honeypots, take-profit escalonado, vault AES-256 y routing de ordenes).

No existe informacion tecnica sobre arquitectura de red neuronal, parametros, contexto, dataset de entrenamiento ni benchmarks. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman que se trata de software de escritorio, no de pesos de modelo. Los campos de pipeline, parametros y contexto deben marcarse como "no disponible".

Desde el punto de vista de evaluacion de modelos, este repositorio **no es utilizable como modelo de IA** y presenta caracteristicas tipicas de distribucion de software potencialmente no verificado: binario precompilado, contrasena fija en el README, enlaces de descarga externos a GitHub Releases de terceros y afirmaciones de rendimiento no contrastables. Se recomienda precaucion maxima antes de ejecutar cualquier binario de este origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No disponible. El repositorio no describe ninguna arquitectura de red neuronal, proceso de entrenamiento, dataset, tokens vistos, RLHF, DPO ni innovaciones tecnicas de modelado. La unica "arquitectura" mencionada en la model card es la de un ejecutable Windows (`solara-executor-v3-keyless-v1.2.2-win64.exe`, build `v1.7.5` / `1B23EE3E33`) empaquetado en un ZIP de 4,8 MB con contrasena `2026`.

Los "modulos" listados en el README (paper-trade sandbox, smart-money copytrade, pre-buy honeypot filter, multi-tier take profit, local AES-256 key vault, sub-40ms order routing) son funcionalidades declaradas de una aplicacion de trading, no componentes de un modelo. Las cifras citadas (respuesta `< 5 ms`, `< 9 ms`, polling `293 Hz`, RAM `< 46 MB`) provienen exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No dispone de soporte de agentes ni multi-step reasoning basado en modelo.
- No dispone de capacidades de vision, audio ni thinking mode.
- El unico "soporte multilingue" es el listado de idiomas en los metadatos del repositorio, sin evidencia de implementacion.
- Funcionalidades declaradas por el autor (no verificadas): sandbox de paper-trading, copytrading de wallets, filtro de honeypots, take-profit escalonado, vault local AES-256 y routing de ordenes por WebSocket/gRPC.

## Casos de uso

- **No aplicable como modelo de IA.** No existe caso de uso legitimo de inferencia, generacion o razonamiento con este repositorio.
- **Auditoria de seguridad de artefactos:** un equipo de seguridad puede usar el repositorio como muestra para analizar practicas de distribucion arriesgadas (binario precompilado, contrasena fija, enlaces a releases de terceros) en un entorno aislado.
- **Estudio de ingenieria social en model cards:** util como ejemplo de model card que imita estructura de repositorio de modelo para distribuir software, dentro de formacion en deteccion de fraude.
- **Analisis de malware en laboratorio air-gapped:** si se decide inspeccionar el binario, hacerlo exclusivamente en maquina virtual sin red, sin credenciales y con monitorizacion de llamadas al sistema.
- **Documentacion de taxonomia de repositorios:** emplearlo como caso de referencia para clasificar repositorios de Hugging Face que no son modelos (software, datasets, artefactos varios).
- **Formacion de desarrolladores:** discutir por que no debe ejecutarse software de trading cripto de origen no verificable ni con claves privadas reales en la misma maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas metricas presentes son afirmaciones del autor sobre el ejecutable (latencia de modulos, frecuencia de polling, consumo de RAM), no comparables con benchmarks de modelos de IA y sin verificacion externa.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay pesos de modelo).
- GPU recomendadas: no disponible; el artefacto esta etiquetado para Windows 10/11 x64 y no declara requisitos de GPU.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: no aplicables vLLM, llama.cpp, Ollama ni TGI, ya que no existen pesos. El unico "despliegue" descrito es ejecutar el `.exe` como administrador en Windows.
- Latencia y throughput: solo cifras declaradas por el autor (`< 5 ms`, `< 9 ms`, `293 Hz`, `< 46 MB` RAM), sin validacion independiente.

## Comparativa con modelos similares

No disponible. Este repositorio no pertenece a ninguna categoria de modelo de IA (LLM, vision, audio, MoE, SSM), por lo que no existe comparativa significativa con modelos de parametros, contexto o rendimiento. Cualquier comparacion con LLMs seria metodologicamente incorrecta.

## Limitaciones y advertencias

- **No es un modelo de IA.** No contiene pesos, tokenizer, configuracion de arquitectura ni pipeline; no puede cargarse con `transformers`, `vLLM`, `llama.cpp` ni similares.
- **Riesgo de seguridad alto:** binario precompilado distribuido via ZIP con contrasena fija publicada en el README, enlazado a releases de terceros (`GraceFernandez01321/...`, `tparker79/...`), sin firmas ni hashes verificables en la informacion disponible.
- **Posible ingenio de distribucion de software no verificado:** la model card mezcla badges de descargas (`596K+`), rating (`4.9/5`) y build, practicas habituales en campanas de distribucion de software dudoso.
- **Riesgo financiero directo:** software de copytrading cripto con "local AES-256 key vault" implica manejo de claves privadas; ejecutarlo puede provocar perdida de fondos.
- **Sesgos, alucinacion y limitaciones de contexto/idioma:** no aplicables al no ser modelo; los idiomas listados son metadatos sin respaldo.
- **Licencia MIT:** permite uso comercial y modificacion, pero no exime de responsabilidad sobre el contenido del binario ni sobre el cumplimiento regulatorio en materia de trading.
- **Caveat de produccion:** no debe integrarse en ningun pipeline de produccion, CI/CD ni entorno con credenciales. Tratar como artefacto no confiable.
- **Datos de rendimiento no verificados:** todas las cifras de latencia, polling y RAM proceden unicamente del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xemdark/gmgn-bullx-photon-copytrade-bot
- Release externa citada en el README (no recomendada): https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
- Releases externas citadas en el README (no recomendadas): https://github.com/tparker79/gmgn-bullx-photon-copytrade-bot/releases/latest
- Paper, blog, demo o documentacion tecnica: no disponible.
