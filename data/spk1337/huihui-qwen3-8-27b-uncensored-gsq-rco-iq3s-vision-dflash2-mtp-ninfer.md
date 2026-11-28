# SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer

## Resumen

Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer es un artefacto de inferencia publicado por el usuario SPK1337 en Hugging Face, construido a partir de una variante "abliterated" (sin censura) del modelo Huihui-Qwen3.8-27B de 27.000 millones de parámetros. No se distribuye en safetensors ni como GGUF directamente cargable, sino en el formato propietario NInfer v3 (`.ninfer`), empaquetado con cuantización mixta GSQ-RCO IQ3_S y componentes multimodales de visión.

El paquete incluye dos backends de decodificación especulativa seleccionables (DFlash2 y MTP) y está ajustado específicamente para GPU NVIDIA Ada Lovelace (sm_89, RTX 4090 con 24 GB de VRAM) bajo Windows y CUDA 13.4, mediante el motor de inferencia C++/CUDA NInfer-all RTX 4090. El objetivo es permitir ejecutar un modelo de 27B con capacidades de visión y contexto largo en una única GPU de consumo.

Su relevancia actual radica en la combinación de cuantización agresiva (IQ3_S mixta), decodificación especulativa y visión en un mismo artefacto optimizado para hardware de consumo, algo poco habitual en releases comunitarios. No obstante, el formato cerrado, la dependencia de un motor específico y la ausencia de benchmarks estandarizados limitan su evaluabilidad frente a alternativas convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27B (según nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explícita; la model card recomienda arrancar con 32K y menciona pruebas con hasta 160K de entrada en el modelo hermano Swift 1.5 |
| Tipos de cuantizacion | GSQ-RCO IQ3_S con precisión mixta (mixed-precision); no se detallan otras variantes |
| Idiomas soportados | en, de, zh |
| Licencia | apache-2.0 |
| Formato de pesos | NInfer v3 (`.ninfer`), no safetensors ni GGUF directamente cargable; el registro de conversión cita un GGUF Huihui abliterated GSQ-RCO IQ3_S como fuente de los pesos de texto |
| Tamano del repo | 15,0 GB (aprox. 13,99 GiB en disco según la model card) |
| Vision | Sí, componente de visión incluido, requiere activación con `--vision` |
| Decodificacion especulativa | DFlash2 o MTP, seleccionables con `--spec dflash2` o `--spec mtp` |
| Hardware objetivo | NVIDIA RTX 4090 (24 GB), SM89, CUDA 13.4, Windows x64 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de identificarlo como un transformer multimodal de tipo image-text-to-text derivado de Qwen3.8-27B, en su variante comunitaria Huihui "abliterated" (técnica de modificación de pesos orientada a eliminar comportamientos de rechazo). El paquete incorpora tres componentes diferenciados: pesos de texto cuantizados en IQ3_S con precisión mixta GSQ-RCO, un módulo de visión y dos mecanismos de decodificación especulativa (DFlash2 y MTP) que actúan como backends de especulación separados y mutuamente excluyentes en tiempo de ejecución.

No se han publicado en la información proporcionada datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La innovación técnica destacable es el empaquetado: cuantización mixta IQ3_S combinada con decodificación especulativa (DFlash2 con 5 tokens de borrador en las pruebas reportadas) y visión opcional, todo integrado en un único artefacto de ~14 GiB diseñado para caber en 24 GB de VRAM y ejecutarse con un motor C++/CUDA portable sin necesidad de CUDA Toolkit instalado.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredado del modelo base Qwen3.8-27B.
- Comprensión de imágenes (image-text-to-text): el componente de visión se activa explícitamente con el flag `--vision`.
- Decodificación especulativa configurable: DFlash2 (con tokens de borrador ajustables) o MTP como backends alternativos de aceleración.
- Servidor local con API compatible con OpenAI, lo que permite integrarlo en clientes y frameworks que hablan el protocolo OpenAI.
- Monitor integrado en el servidor local (`/monitor`) para inspeccionar utilización de GPU, VRAM, temperatura, throughput de tokens, tasa de aceptación de DFlash2 y ocupación de KV cache.
- Multilingüe limitado a inglés, alemán y chino según los metadatos declarados.
- Variante "abliterated": ausencia (parcial o total, no verificada) de mecanismos de rechazo, orientada a usos sin restricciones de contenido.
- Soporte de contexto largo en la práctica: la model card menciona pruebas de hasta 160K tokens de entrada en el artefacto hermano, aunque para este paquete se recomienda arrancar con 32K.

## Casos de uso

- Inferencia local en RTX 4090 con contexto largo: desplegar un modelo de 27B cuantizado en una única GPU de consumo de 24 GB, arrancando con 32K de contexto y escalando según la VRAM disponible, gracias a la cuantización IQ3_S mixta y al tamaño de ~14 GiB del artefacto.
- Aceleración de generación con decodificación especulativa: activar `--spec dflash2` con 5 tokens de borrador para reducir la latencia en tareas de generación larga, o `--spec mtp` como alternativa, midiendo la tasa de aceptación en el monitor integrado.
- Asistentes conversacionales sin filtros editoriales: escenarios de investigación sobre comportamiento de modelos, red teaming y análisis de sesgos donde se requiere un modelo sin mecanismos de rechazo para estudiar respuestas límite.
- Procesamiento de documentos con imágenes: usar `--vision` para tareas de image-text-to-text como descripción de capturas, extracción de información de figuras o análisis de documentos escaneados, combinado con el contexto largo para múltiples páginas.
- Integración en herramientas de desarrollo: aprovechar la API compatible con OpenAI del servidor NInfer para conectar el modelo a editores, agentes de código o scripts existentes sin adaptadores adicionales.
- Monitorización y ajuste de rendimiento en producción local: usar el dashboard `/monitor` para medir throughput, ocupación de KV cache y aceptación de especulación, y ajustar los flags de lanzamiento en consecuencia.
- Evaluación comparativa de motores de inferencia: emplear el artefacto junto con el motor NInfer-all RTX 4090 para reproducir los benchmarks publicados (146,6 tok/s de mediana en decodificación) y comparar con vLLM, llama.cpp u otros motores en hardware equivalente.

## Benchmarks y rendimiento

Los datos publicados corresponden a métricas de inferencia del motor NInfer en RTX 4090, no a benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.), que no se han publicado en la información disponible.

| Metrica (RTX 4090, CUDA 13.4, SM89, DFlash2 con 5 tokens de borrador) | Resultado |
|---|---|
| Velocidad mediana de decodificación | 146,6 tokens/s |
| Velocidad de decodificación percentil 90 | 215,5 tokens/s |
| Velocidad mediana de prefill largo (>4.096 tokens computados, 316 peticiones) | 2.345 tokens/s |
| Peticiones completadas / tokens generados | 1.831 / 2.754.629 |

Notas metodológicas de la model card: las tasas se calculan a partir de los tiempos de petición, no son throughput extremo a extremo ni un benchmark estandarizado, y no demuestran una aceleración frente a NInfer estándar. MTP y la entrada de imágenes no se incluyeron en el benchmark. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa ~14 GiB en disco; en inferencia, un proveedor externo (corehu.com) estima ~66 GB de VRAM para ejecutar el modelo de 27B, cifra que probablemente asume precisión mayor o contexto muy largo. Con la cuantización IQ3_S y contexto de 32K, el objetivo declarado es caber en 24 GB.
- GPU recomendada: NVIDIA RTX 4090 (24 GB, SM89) es el objetivo explícito del perfil de compilación. Otras GPU Ada Lovelace con sm_89 podrían funcionar, pero no están validadas en la información disponible. GPU de datacenter (A100, H100) no están mencionadas ni validadas para este artefacto concreto.
- Cabe en GPU de consumo: sí, en RTX 4090 de 24 GB según el diseño del paquete; no se confirma para GPUs de 16 GB o menos.
- Opciones de despliegue: exclusivamente el motor NInfer-all RTX 4090 (binarios Windows x64 portables, C++/CUDA 13.4, sin necesidad de CUDA Toolkit). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` no es GGUF ni safetensors.
- Latencia y throughput: mediana de 146,6 tok/s en decodificación y 2.345 tok/s en prefill largo en RTX 4090 con DFlash2 (5 tokens de borrador), según las mediciones del autor.
- Sistema operativo: Windows x64; no se menciona soporte Linux en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Formato | Licencia | Motor de inferencia |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-Uncensored GSQ-RCO IQ3_S (este) | 27B | 32K recomendado (hasta 160K probado en el hermano) | Sí | NInfer v3 | apache-2.0 | NInfer-all RTX 4090 (Windows, CUDA) |
| Huihui-Qwen3.8-27B-Swift1.5-Abliterated-IQ3S-DFlash2-NInfer (hermano) | 27B | hasta 160K en pruebas históricas | Sí (opcional) | NInfer v3 | apache-2.0 | NInfer-all RTX 4090 |
| Qwen3.8-27B base (upstream) | 27B | no disponible en la información | no disponible | safetensors (habitual) | no disponible en la información | vLLM, TGI, llama.cpp, etc. |
| Alternativas cuantizadas GGUF de 27B (genéricas) | ~27B | variable | variable | GGUF | variable | llama.cpp, Ollama |

La comparación directa con modelos de la misma categoría en formato estándar no está disponible en la información proporcionada. El artefacto hermano Swift 1.5 comparte tamaño (~13,99 GiB) y componentes, pero la propia model card advierte que los resultados de benchmarks no establecen una clasificación directa de velocidad o calidad entre ambos.

## Limitaciones y advertencias

- Formato propietario: no es safetensors ni GGUF cargable; requiere el motor NInfer-all RTX 4090, lo que limita la portabilidad y la integración con el ecosistema estándar (vLLM, llama.cpp, Ollama, TGI).
- Dependencia de plataforma: binarios orientados a Windows x64, CUDA 13.4 y sm_89 (RTX 4090); no hay validación publicada para Linux, A100, H100 u otras arquitecturas.
- Modelo "abliterated" sin censura: elimina o reduce los mecanismos de rechazo, lo que implica riesgo elevado de generar contenido dañino, sesgado o inapropiado; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 27B cuantizados a IQ3_S; la cuantización agresiva puede degradar la fidelidad en tareas de razonamiento complejo.
- Idiomas limitados: solo inglés, alemán y chino declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de visión en la información disponible, lo que impide comparar su calidad frente a alternativas.
- Métricas de rendimiento no estandarizadas: las cifras de 146,6 tok/s son mediciones de peticiones reales, no un benchmark reproducible estándar, y la propia model card advierte que no demuestran aceleración frente a NInfer estándar.
- Visión y MTP no evaluados en el benchmark: el rendimiento con imágenes o con el backend MTP es desconocido.
- Estimación externa de VRAM discrepante: un proveedor de cloud estima ~66 GB de VRAM, muy por encima de los 24 GB objetivo; conviene validar el consumo real con contexto largo antes de desplegar.
- Licencia apache-2.0 declarada, pero la cadena de derivación (Qwen3.8 base → Huihui abliterated → GGUF → NInfer) puede introducir obligaciones adicionales no detalladas; verificar antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Uncensored-GSQ-RCO-IQ3S-Vision-DFlash2-MTP-NInfer
- Modelo hermano Swift 1.5: https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Swift1.5-Abliterated-IQ3S-DFlash2-NInfer
- Repositorio del motor NInfer-all RTX 4090: https://github.com/spk-c/ninfer-all-rtx4090
- Binarios Windows (releases): https://github.com/spk-c/ninfer-all-rtx4090/releases/latest
- Guía de configuración y ajuste RTX 4090: https://github.com/spk-c/ninfer-all-rtx4090/blob/master/docs/rtx4090.md
- Benchmarks del motor: https://github.com/spk-c/ninfer-all-rtx4090#rtx-4090-benchmarks
- Portal del proyecto: https://spk-c.github.io/ninfer-all-rtx4090/
- Configurador de VRAM y lanzamiento: https://spk-c.github.io/ninfer-all-rtx4090/configurator.html
- Benchmarks reproducibles (portal): https://spk-c.github.io/ninfer-all-rtx4090/benchmarks.html
- Guía del monitor: https://spk-c.github.io/ninfer-all-rtx4090/monitor.html
- Proveedor cloud que lista el modelo: https://corehu.com/run/spk1337--huihui-qwen3.8-27b-uncensored-gsq-rco-iq3s-vision-dflash2-mtp-ninfer?lang=zh
