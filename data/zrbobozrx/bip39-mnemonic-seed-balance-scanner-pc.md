# zrbobozrx/bip39-mnemonic-seed-balance-scanner-pc

## Resumen

El repositorio `zrbobozrx/bip39-mnemonic-seed-balance-scanner-pc` no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido a través de Hugging Face, etiquetado con términos propios de la gestión de carteras de criptomonedas (BIP39, derivación de direcciones, comprobación de saldos). El autor lo presenta como una herramienta portable que verifica frases mnemónicas de 12, 18 y 24 palabras y consulta saldos en varias cadenas.

La model card describe módulos de validación local de BIP39, parseo de keystores LevelDB, auditoría de tokens ERC20 y SPL, y un motor SIMD multihilo con derivación BIP44/BIP84 para EVM, Solana y Bitcoin. Ninguno de estos componentes corresponde a una arquitectura de red neuronal: no hay parámetros, tokenizador, ventana de contexto ni pesos en formato safetensors o GGUF. El repositorio incluye además un binario `.exe` alojado en un repositorio de GitHub de terceros, protegido con contraseña, y recomienda desactivar advertencias de Windows Defender y ejecutarlo como administrador.

Por tanto, esta ficha no puede documentar un modelo de IA. El contenido es relevante únicamente como advertencia de seguridad: la combinación de ingeniería social (badges de valoración, instrucciones de instalación), ejecutables ofuscados, contraseñas en la propia documentación y peticiones de privilegios elevados coincide con patrones habituales de malware o de herramientas de drenaje de carteras. No se debe descargar ni ejecutar el binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe utilidades BIP39/LevelDB/SIMD) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio distribuye un `.exe` y un `.zip`, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. La documentación describe un ejecutable nativo para Windows x64 con módulos de validación de entropía y checksum BIP39, derivación de claves jerárquicas BIP44/BIP84, lectura de almacenes LevelDB asociados a extensiones de navegador y consultas de saldo en cadenas EVM, Solana y Bitcoin. Se mencionan hilos de trabajo (4 y 7 según el módulo), latencias de respuesta inferiores a 7 ms y un sondeo a 138 Hz, cifras que no son verificables y que no se acompañan de código fuente ni de artefactos reproducibles.

No hay información sobre datos de entrenamiento, ajuste por refuerzo, destilación ni ninguna innovación técnica propia de modelos fundacionales. El repositorio no incluye `config.json`, `tokenizer.json`, ficheros `safetensors` ni ningún otro artefacto que permita cargar el contenido como modelo en bibliotecas como Transformers, vLLM o llama.cpp.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de los modelos generativos.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de comprensión o generación; los idiomas listados son metadatos del repositorio.
- No dispone de modo de pensamiento, visión, audio ni multimodalidad.
- La funcionalidad declarada por el autor se limita a operaciones de criptografía de carteras (validación BIP39, derivación de direcciones, consulta de saldos), sin evidencia técnica verificable en el repositorio.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y no debe integrarse en pipelines de inferencia.
- Auditoría de seguridad defensiva: el repositorio puede estudiarse como ejemplo de campaña de distribución de ejecutables sospechosos en plataformas de modelos, para formar a equipos en la detección de este patrón.
- Análisis de threat intelligence: extraer indicadores (nombre del binario, contraseña del archivo, repositorio de GitHub referenciado) para incluirlos en listas de bloqueo.
- Formación en concienciación: ilustrar por qué no deben ejecutarse binarios descargados de repositorios de modelos ni desactivarse las protecciones del sistema operativo.
- Documentación de gobernanza: usar el caso para justificar políticas de revisión de artefactos antes de su descarga en entornos corporativos.
- Investigación sobre abuso de plataformas: analizar cómo se manipulan etiquetas y badges para posicionar contenido malicioso en catálogos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras del repositorio (respuesta en menos de 7 ms, sondeo a 138 Hz, 4 y 7 hilos) son afirmaciones del autor sin metodología ni reproducibilidad, y no corresponden a métricas de modelos de IA como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un ejecutable Windows x64.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, extracción previa de un ZIP de 8,9 MB protegido con contraseña.
- Latencia y throughput: no verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el repositorio no contiene un modelo de IA. Frente a modelos reales de la misma plataforma (por ejemplo, modelos de lenguaje de tamaño pequeño o mediano con pesos en safetensors y licencia abierta), la diferencia fundamental es que aquí no hay artefactos de modelo, ni tarjeta técnica verificable, ni código fuente, ni métricas reproducibles.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura, tokenizador y cualquier componente evaluable con las herramientas habituales del ecosistema.
- Riesgo de seguridad alto: la instalación implica descargar un `.exe` desde un repositorio de GitHub de terceros, extraerlo con una contraseña publicada en la propia documentación y ejecutarlo con privilegios de administrador.
- La documentación pide explícitamente ignorar o desactivar avisos de Windows Defender y SmartScreen, práctica contraria a las recomendaciones de seguridad.
- El binario se presenta como herramienta de gestión de frases semilla y saldos de carteras, lo que lo sitúa en la categoría de software de alto riesgo para la custodia de claves.
- No hay código fuente, trazabilidad de build ni firmas de reproducibilidad que permitan verificar qué ejecuta el binario.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido distribuido ni sobre el binario alojado fuera de Hugging Face.
- Los idiomas y etiquetas del repositorio son metadatos; no implican capacidades lingüísticas del artefacto.
- Descargas y likes a cero en el momento de la consulta: sin validación por parte de la comunidad.
- Recomendación: no descargar, no extraer y no ejecutar el contenido; si se ha ejecutado, tratar el sistema como potencialmente comprometido y rotar cualquier clave o frase semilla accesible desde él.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zrbobozrx/bip39-mnemonic-seed-balance-scanner-pc
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/mSyed47/bip39-mnemonic-seed-balance-scanner-pc
- Descarga directa citada en la model card (no recomendada): https://github.com/mSyed47/bip39-mnemonic-seed-balance-scanner-pc/releases/latest/download/bip39-mnemonic-seed-balance-scanner-pc-v1.2.0-win64.zip
- Documentación de referencia sobre BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Documentación de referencia sobre BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- Documentación de referencia sobre BIP84: https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki
