# Woj93/solana-pump-fun-jito-bundler-sniper

## Resumen

El repositorio `Woj93/solana-pump-fun-jito-bundler-sniper` de Hugging Face **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64 (un binario `.exe` distribuido dentro de un ZIP de 4,8 MB) que se presenta como una herramienta de trading automatizado para el ecosistema Solana, concretamente orientada a operaciones de *bundling* de wallets, *sniping* de lanzamientos en Pump.fun y ejecución a través del *relayer* Jito.

El artefacto carece de arquitectura de red neuronal, pesos, tokenizador o pipeline asociado: la *model card* describe funcionalidades de software de trading (gestión de 20 wallets mediante Lookup Tables, *take profit* multinivel, copia de wallets *smart-money*, filtro de *honeypots*, bóveda local AES-256) y no incluye ninguna referencia a parámetros, contexto, cuantización o datos de entrenamiento. No es, por tanto, un modelo evaluable en los términos habituales de esta ficha.

La relevancia de documentarlo reside en su carácter de **riesgo de seguridad**: la *model card* incluye enlaces de descarga alojados en repositorios de GitHub de terceros (`Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026`, `VusujuDa80/solana-pump-fun-jito-bundler-sniper`), instrucciones para ejecutar un binario como Administrador y una contraseña de descompresión fija (`2026`). El nombre del ejecutable (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`) no guarda relación con la funcionalidad declarada, patrón típico de campañas de *malware* o *scam* distribuidas a través de repositorios de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.exe` dentro de un `.zip` de 4,8 MB) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni artefactos de *machine learning*: no hay ficheros `safetensors`, `GGUF`, `ONNX` ni configuración de transformer, MoE, SSM o arquitectura híbrida. La *model card* describe únicamente un ejecutable de escritorio con módulos de trading (bundler de 20 wallets, *take profit* multinivel, copia de *smart-money*, *sandbox* de paper trading, filtro de *honeypots* y bóveda de claves AES-256), sin aportar información sobre datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No implementa razonamiento multi-paso ni modo *thinking*.
- No tiene capacidades de visión, audio ni multimodalidad.
- Las "capacidades" declaradas por el autor son funcionalidades de un programa de trading (bundling de wallets, sniping, copia de wallets, filtros de seguridad de tokens), no capacidades de un modelo.
- El etiquetado multilingüe (14 idiomas) procede de los metadatos del repositorio, no de un tokenizador o corpus de entrenamiento verificable.

## Casos de uso

- **No recomendado para ningún uso en producción.** El artefacto no es un modelo y su cadena de distribución presenta indicios claros de riesgo.
- **Auditoría de seguridad / threat intelligence**: analizar la *model card* y los enlaces para documentar campañas de distribución de binarios sospechosos en Hugging Face y GitHub, con fines de concienciación o bloqueo en redes corporativas.
- **Formación en detección de scams**: usar el ejemplo como caso práctico de ingeniería social (badges falsos de "99% verificado", "926K+ descargas", contraseña fija de ZIP, instrucciones de ejecutar como Administrador) en cursos de seguridad.
- **Investigación de malware (entorno aislado)**: si se analiza el binario, hacerlo exclusivamente en una máquina virtual sin red y sin claves, nunca en un equipo de trabajo.
- **Verificación de políticas de plataforma**: servir como ejemplo para moderadores de repositorios sobre contenido que debería revisarse o retirarse por suplantación de identidad de modelo y distribución de ejecutables.
- **Documentación de taxonomías**: clasificar el artefacto como "no-modelo" dentro de catálogos internos de modelos, evitando que se cuele en inventarios de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de ningún tipo (MMLU, HumanEval, GSM8K ni equivalentes), y las cifras que aparecen en la *model card* (181 Hz de polling, 98,4% de consistencia, < 36 ms, < 10 ms, < 28 ms) son afirmaciones del autor sobre el software, no mediciones verificables de un modelo.

## Requisitos de hardware

- **VRAM**: no aplica; no hay modelo que cargar en GPU.
- **GPU recomendadas**: no aplica.
- **Compatibilidad con GPU de consumo**: no aplica.
- **Requisitos declarados por el autor**: Windows 10 u 11 de 64 bits, ejecución como Administrador, 4,8 MB de espacio para el ZIP.
- **Opciones de despliegue**: no aplica (vLLM, llama.cpp, Ollama, TGI no son relevantes). El artefacto se distribuye como `.exe` portable.
- **Latencia y throughput**: no disponibles; las cifras de la *model card* no son verificables ni corresponden a inferencia de un modelo.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. A modo de contraste, se incluye una tabla con referencias reales de la misma temática (trading en Solana) que sí son software legítimo y auditable:

| Criterio | Este repositorio | Jupiter Aggregator (API/SDK) | Jito Labs (relayer/SDK) | Solana Web3.js |
|---|---|---|---|---|
| Tipo | Binario `.exe` opaco | API y SDK open source | Infraestructura y SDK | Librería cliente |
| Código fuente auditable | No | Sí | Parcial (SDK) | Sí |
| Licencia | MIT declarada | Apache-2.0 / MIT | Apache-2.0 | Apache-2.0 |
| Reputación / mantenimiento | Desconocida, 0 descargas, 0 likes | Amplia adopción | Amplia adopción | Estándar de facto |
| Riesgo de seguridad | Alto (binario + password + enlaces externos) | Bajo | Bajo | Bajo |

## Limitaciones y advertencias

- **No es un modelo de IA**: no debe inventariarse como tal ni evaluarse con métricas de LLM.
- **Riesgo de malware**: el ejecutable se distribuye con contraseña de ZIP fija (`2026`) y se pide ejecutarlo como Administrador; ambos patrones evitan el análisis automático de antivirus y elevan privilegios.
- **Suplantación de identidad**: el nombre del binario (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`) no corresponde a la funcionalidad declarada, lo que sugiere reempaquetado o *scam*.
- **Enlaces externos no verificados**: las descargas apuntan a repositorios de GitHub de terceros ajenos al autor del repo de Hugging Face.
- **Afirmaciones no verificables**: badges de "99% verificado", "926K+ descargas" y métricas de latencia sin fuente.
- **Riesgo financiero**: cualquier herramienta de *sniping* o *bundling* en Solana puede implicar pérdida de fondos, exposición de claves privadas y posibles infracciones de los términos de servicio de las plataformas.
- **Licencia**: MIT declarada, pero sin código fuente disponible para verificar el cumplimiento ni la ausencia de componentes maliciosos.
- **Sin soporte ni mantenimiento**: 0 descargas, 0 likes y actualización única en la misma fecha de creación.
- **Recomendación**: no descargar, no ejecutar y reportar el repositorio a Hugging Face si se detecta en entornos corporativos o de investigación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Woj93/solana-pump-fun-jito-bundler-sniper
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Repositorio de releases citado (no verificado): https://github.com/VusujuDa80/solana-pump-fun-jito-bundler-sniper/releases/latest
- Documentación oficial de Solana: https://solana.com/docs
- Documentación de Jito: https://docs.jito.wtf
- Pump.fun: https://pump.fun
