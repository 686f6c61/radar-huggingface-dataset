# Zahhak3436/trust-wallet-metamask-seed-recovery-2026-u

## Resumen

El repositorio `Zahhak3436/trust-wallet-metamask-seed-recovery-2026-u` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face que se presenta como una supuesta herramienta de "recuperación de seed de Trust Wallet y MetaMask" para Windows, empaquetada como un ejecutable (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`) dentro de un ZIP protegido con contraseña. No hay pesos, no hay tarjeta de modelo técnica, no hay pipeline declarado y el repositorio no expone ningún artefacto de aprendizaje automático.

La model card es en realidad un señuelo de ingeniería social: mezcla insignias falsas (descargas, tamaño, build), instrucciones para ejecutar un binario como administrador y una contraseña de archivo (`2026`), todo ello bajo una apariencia de ficha técnica. Los nombres de los ficheros descargables remiten a un repositorio de GitHub de terceros (`ekaterina96522/fisch-script-auto-catch-macro`), ajeno al autor declarado, lo que constituye una señal clásica de cadena de distribución maliciosa.

Desde la perspectiva de un editor técnico, este artefacto no es evaluable como modelo y no debe descargarse ni ejecutarse. La ficha que sigue documenta la ausencia de especificaciones reales y advierte de los riesgos asociados, sin reproducir en ningún caso las instrucciones de instalación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, sin modelo subyacente) |
| Licencia | MIT (declarada en metadatos; sin fichero LICENSE verificable) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento ni proceso de ajuste que documentar. El contenido del repositorio es un binario compilado para Windows 10/11 x64, distribuido como archivo comprimido de 4,8 MB con contraseña, junto con una model card que describe funcionalidades de recuperación de frases semilla BIP39, parseo de keystores LevelDB y rotación de RPC.

Los elementos técnicos mencionados en la model card (PBKDF2, SIMD, LevelDB, BIP39) son componentes criptográficos y de sistema, no capas de un transformer. No hay información sobre datos, tokens, RLHF, DPO ni innovaciones de inferencia, porque no hay inferencia de un modelo lingüístico implicada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas de metadatos sin modelo asociado.
- El binario declara funcionalidades de recuperación de seed, validación BIP39, exportación de saldos y parseo de keystores, presentadas como "módulos" de una herramienta de escritorio.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo y su ejecución con privilegios de administrador constituye un riesgo de seguridad.
- Auditoría de seguridad defensiva: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para caracterizar su comportamiento, sin ejecutarlo en sistemas de producción ni con acceso a carteras.
- Estudio de campañas de ingeniería social en Hugging Face: documentar patrones de repositorios señuelo que suplantan utilidades de criptomonedas para distribuir ejecutables.
- Formación en concienciación: usar la model card como ejemplo de señales de alarma (contraseña en el README, enlaces a repositorios de terceros, insignias de descargas no verificables).
- Investigación de cadena de suministro: rastrear la relación entre el repositorio de Hugging Face y el repositorio de GitHub referenciado en los enlaces de descarga.
- Denuncia y reporte a la plataforma: notificar a Hugging Face para la retirada del artefacto por suplantación de marca y posible distribución de malware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: no existe modelo evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- No requiere GPU ni VRAM: no hay inferencia de modelo.
- Entorno de ejecución declarado: Windows 10 (22H2) y Windows 11 (24H2), x64.
- No cabe en ningún acelerador porque no es un modelo; el artefacto es un ejecutable de escritorio de 4,8 MB.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles y sin sentido en este contexto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zahhak3436/trust-wallet-metamask-seed-recovery-2026-u | Ejecutable Windows (no es modelo) | no disponible | no disponible | MIT declarada | Hugging Face, 0 descargas |
| Modelos de lenguaje open source (p. ej. familias Llama, Qwen, Mistral) | LLM transformer | miles de millones | decenas de miles de tokens | licencias abiertas | Hugging Face, amplia adopción |
| Herramientas legítimas de recuperación de carteras | Software de escritorio | no aplica | no aplica | propietaria o abierta | canales oficiales de los fabricantes |

No existe comparación técnica posible con modelos de IA: la categoría es distinta y el artefacto no expone parámetros, contexto ni rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, razonamiento o código es infundada.
- Riesgo de seguridad elevado: la model card instruye a ejecutar un `.exe` como administrador y a extraer un ZIP con contraseña, patrón habitual de distribución de malware.
- Suplantación de marca: el nombre invoca Trust Wallet y MetaMask sin relación verificable con sus fabricantes.
- Enlaces de descarga apuntan a un repositorio de GitHub de terceros (`ekaterina96522/fisch-script-auto-catch-macro`), incoherente con el autor declarado.
- Insignias de descargas (692K+) y build no verificables; el repositorio registra 0 descargas y 0 likes en Hugging Face.
- Licencia MIT declarada en metadatos, pero sin fichero LICENSE ni código fuente que la respalde; no hay garantía de uso comercial ni de seguridad.
- Idiomas listados sin modelo subyacente: las etiquetas multilingües no implican capacidad lingüística alguna.
- Fecha de creación futura (2026-11-24) y nomenclatura "2026": inconsistencias temporales que refuerzan la naturaleza señuelo del artefacto.
- No debe ejecutarse en producción, ni en máquinas con acceso a carteras, credenciales o datos personales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zahhak3436/trust-wallet-metamask-seed-recovery-2026-u
- Repositorio de GitHub referenciado en la model card (terceros, no verificado): https://github.com/ekaterina96522/fisch-script-auto-catch-macro
- Repositorio de GitHub mencionado como origen del paquete: https://github.com/alexeimendoza/trust-wallet-metamask-seed-recovery-2026-unlocked
- Documentación oficial de BIP39 (referencia técnica citada en la model card): https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Canales oficiales de Trust Wallet: https://trustwallet.com
- Canales oficiales de MetaMask: https://metamask.io
