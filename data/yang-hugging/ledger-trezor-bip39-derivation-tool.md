# Yang-Hugging/ledger-trezor-bip39-derivation-tool

## Resumen

El repositorio `Yang-Hugging/ledger-trezor-bip39-derivation-tool` no contiene un modelo de IA: es un paquete distribuible para Windows que se presenta como una herramienta de derivación de claves BIP39 asociada a carteras hardware Ledger y Trezor. La model card describe un ejecutable (`ledger-trezor-bip39-derivation-tool-v1.2.0-win64.exe`) empaquetado en un ZIP de 8,9 MB protegido con contraseña, con funciones de resolución de mnemónicos parciales, derivación multi-cadena (BIP44/BIP84 sobre EVM, Solana y BTC) y parseo de keystores LevelDB.

No se trata de un modelo de lenguaje ni de una red neuronal: no hay arquitectura transformer, ni pesos, ni tokenizador, ni pipeline de inferencia declarado en Hugging Face (`pipeline: no disponible`). Los tags del repositorio son de plataforma (`windows`, `windows-11`, `x64`, `portable`) y de idioma, no de tipología de modelo. Por tanto, esta ficha documenta el artefacto tal y como aparece publicado y advierte de que no es evaluable como modelo de IA.

La relevancia técnica del artefacto es nula desde el punto de vista de la IA open source, y su interés se limita al ámbito de la seguridad. El patrón de publicación (ZIP con contraseña, ejecutable que requiere permisos de administrador, insignias de descargas y valoraciones no verificables, enlaces a un repositorio de GitHub de terceros) coincide con campañas habituales de distribución de software potencialmente malicioso orientado a la exfiltración de material criptográfico sensible. Se recomienda tratarlo como no fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con ejecutable `.exe`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. La model card describe un programa nativo para Windows 10 (22H2) y Windows 11 (24H2) con módulos declarados de resolución de mnemónicos parciales, derivación de direcciones BIP44/BIP84, parser de keystores LevelDB, exportación de saldos y validación local de BIP39. Se mencionan detalles de implementación como bucle de sondeo a 403 Hz, seis hilos de trabajo, uso de SIMD y PBKDF2, y consumo de memoria inferior a 40 MB, pero no se aporta código fuente, binarios reproducibles ni verificación independiente de esas afirmaciones.

No hay dataset, ni número de tokens, ni fases de RLHF, DPO o ajuste supervisado. La etiqueta `license: mit` figura en los metadatos, pero el repositorio no incluye el texto de la licencia ni el código que permitiría ejercer los derechos que esta concede.

## Capacidades

- No es un modelo generativo: no produce texto, código, razonamiento ni matemáticas.
- No dispone de tool calling, function calling ni soporte de agentes.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento extendido.
- La model card declara funciones de utilidad para criptomonedas: reconstrucción de palabras de un mnemónico BIP39, derivación de direcciones en EVM, Solana y Bitcoin, y lectura de keystores LevelDB locales.
- Declara validación offline de entropía y checksum para mnemónicos de 12, 18 y 24 palabras.
- Los idiomas listados corresponden a los metadatos del repositorio, no a capacidades lingüísticas verificadas de ningún modelo.

## Casos de uso

- Ninguno recomendado en el ámbito de IA: el artefacto no es un modelo y no puede desplegarse en pipelines de inferencia, servidores de inferencia ni frameworks como vLLM, TGI o llama.cpp.
- Auditoría de seguridad defensiva: analizar el binario en un entorno aislado y sin conexión para caracterizar su comportamiento real antes de cualquier otra consideración.
- Estudio de campañas de ingeniería social: el patrón de publicación (ZIP con contraseña, ejecución como administrador, insignias de descargas infladas) sirve como caso de ejemplo en formación de concienciación.
- Verificación de la cadena de suministro: comprobar la trazabilidad entre el repositorio de Hugging Face y el repositorio de GitHub referenciado, que no coinciden en nombre de organización.
- No debe emplearse para gestionar mnemónicos, claves privadas ni saldos reales bajo ninguna circunstancia.
- No debe integrarse en herramientas de custodia, carteras ni procesos de recuperación de fondos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (403 Hz de sondeo, seis hilos, menos de 40 MB de RAM, 98,5 % de consistencia en validación) son afirmaciones del autor sin metodología, sin conjunto de prueba y sin replicación independiente; no constituyen benchmarks comparables.

## Requisitos de hardware

- Plataforma declarada: Windows 10 (22H2) y Windows 11 (24H2), 64 bits (x64).
- Memoria declarada por el autor: menos de 40 MB de RAM en el motor SIMD y menos de 22 MB en la exportación de informes.
- No requiere GPU ni VRAM: no hay inferencia de red neuronal.
- No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput no verificables; las cifras publicadas carecen de condiciones de medición.
- Tamaño del paquete: 8,9 MB (ZIP), con contraseña de extracción indicada en la model card.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a ninguna categoría de modelo de IA. Frente a herramientas legítimas de derivación BIP39 (por ejemplo, bibliotecas de referencia en Python o Rust mantenidas públicamente), la diferencia relevante es que aquí se distribuye un binario opaco para Windows en lugar de código fuente auditable, lo que impide cualquier comparación técnica de rendimiento o corrección.

## Limitaciones y advertencias

- No es un modelo de IA: carece de arquitectura, pesos, tokenizador y pipeline; cualquier evaluación como modelo es inaplicable.
- Señales de riesgo elevadas: binario precompilado, ZIP protegido con contraseña, instrucción de ejecutar como administrador y enlaces de descarga alojados en un repositorio de GitHub (`PetraMoon/...`) distinto del identificador de Hugging Face (`Yang-Hugging/...`).
- Las insignias de valoración (4,8/5) y de descargas (706K+) no son verificables y no proceden de métricas de Hugging Face, donde el repositorio registra 0 descargas y 0 likes.
- La temática (mnemónicos BIP39, claves de carteras hardware, keystores de extensiones) es la propia de campañas de robo de criptoactivos; ejecutar el binario puede comprometer fondos de forma irreversible.
- La licencia MIT declarada no va acompañada del fichero de licencia ni del código fuente, por lo que su aplicabilidad es dudosa.
- No hay sesgos lingüísticos ni de alucinación evaluables al no existir modelo, pero sí un riesgo claro de suplantación de identidad de marca (Ledger, Trezor) en el nombre del artefacto.
- No debe ejecutarse en máquinas con carteras, seeds o credenciales; si ya se ha ejecutado, procede rotar claves y revisar el sistema desde un medio limpio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yang-Hugging/ledger-trezor-bip39-derivation-tool
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/PetraMoon/ledger-trezor-bip39-derivation-tool
- Página de releases referenciada (no verificada): https://github.com/PetraMoon/ledger-trezor-bip39-derivation-tool/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
