# SZLHOLDINGS/szl-khipu

## Resumen

SZLHOLDINGS/szl-khipu es un repositorio de codigo Python (libreria numpy) que implementa un conjunto de primitivas de gobernanza de IA bajo el nombre "Governed-AI khipu". No se trata de un modelo de lenguaje preentrenado, sino de un paquete de software que ofrece un gate Lambda (Λ) de caracter consultivo, una atencion por canales contiguos llamada YARQA, un clasificador binario TinyKhipu-Nano con modo NAVIGATE/ABSTAIN, un agente de recepcion con cuatro estados (ReceiptAgent-Nano) y generacion de receipts criptograficos basados en SHA-256. Desarrollado por SZLHOLDINGS, el proyecto busca aportar transparencia y verificabilidad a los pipelines de IA, con un enfasis explicito en la honestidad: la confianza probada siempre es falsa, la energia medida no esta disponible y la unicidad de Λ permanece como conjetura abierta.

El repositorio es ligero (0.0 GB) y funciona exclusivamente en CPU con numpy, sin soporte CUDA ni GPU. Incluye una serie de formulas verificadas en Lean (exactamente 8, bajo el nombre "Locked-8") que cubren propiedades como determinismo de replay, aciclicidad de grafos, conservacion de reciprocidad y acotamiento de Kuramoto, entre otras. No hereda los benchmarks de los sistemas que "siluetea" (FlashAttention, PagedAttention, FlexAttention, SageAttention, RMSNorm), y declara explicitamente que no es un rehosting ni un fine-tune de Qwen ni de ningun otro LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete numpy (no es una red neuronal) |
| Parametros totales | No aplicable (codigo fuente; TinyKhipu-Nano tiene unos pocos miles de floats) |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplicable (codigo fuente Python/numpy; exporta artefactos .npz) |

## Arquitectura y entrenamiento

El repositorio no contiene una arquitectura de red neuronal tradicional. En su lugar, implementa varios componentes modulares:

- **Λ-gate**: media geometrica ponderada sobre 13 ejes "Yuyay", con comportamiento fail-closed si cualquier eje es cero o no finito. Es consultivo y nunca otorga confianza probada.
- **YARQA**: atencion por canales contiguos (inspirada en el termino quechua *yarqa*, canal de riego). La atencion se restringe al interior de cada compartimento; la fuga (leak) es la cota de error. Implementado en numpy, sin cuantizacion.
- **TinyKhipu-Nano**: clasificador binario de silueta (NAVIGATE/ABSTAIN) con un filtro de identidad estricto. Su entrenamiento se realiza mediante un script que genera un receipt SHA-256 de pesos, semilla, pasos y perdida.
- **ReceiptAgent-Nano**: compuerta de cuatro vias (HARD_DENY, DENY_DEFAULT, LAMBDA_VETO, ALLOW). El kernel es la verdad y el agente no puede anularlo.
- **Receipts**: resumen criptografico (SHA-256) de pesos, semilla, pasos y perdida. La honestidad se reporta, la energia (joules) es null.

No se proporcionan datos de entrenamiento mas alla de los mencionados (semilla y pasos configurables). El paquete incluye formulas verificadas en Lean (Locked-8) que cubren propiedades matematicas de los componentes, aunque se advierte que la verificacion numerica de laboratorio no equivale a una prueba formal completa.

## Capacidades

- Generacion de receipts criptograficos de entrenamiento (SHA-256 de pesos, semilla, pasos y perdida) para auditoria de integridad.
- Evaluacion consultiva mediante el gate Λ: combina 13 ejes de metrica y bloquea si alguno es cero o no finito.
- Atencion por canales contiguos (YARQA) con cota de fuga controlada, implementada en numpy.
- Clasificacion binaria con abstencion (TinyKhipu-Nano): puede emitir NAVIGATE o ABSTAIN, con filtro de identidad estricto.
- Compuerta de decision de cuatro estados (ReceiptAgent-Nano) que no puede ser anulada por un agente externo.
- Verificacion de integridad de pipelines: permite comprobar que un receipt coincide con el estado actual de los artefactos.
- Sin soporte de generacion de texto, tool calling, vision, audio ni capacidades multilingues (no es un LLM).

## Casos de uso

- Auditoria de entrenamiento de modelos: generar un receipt SHA-256 que inmovilice pesos, semilla, pasos y perdida de un entrenamiento, permitiendo verificar posteriormente que no hubo manipulacion.
- Gobernanza de decisiones de IA: utilizar el gate Λ como compuerta consultiva que combina 13 metricas de evaluacion y bloquea automaticamente si alguna es cero o no finita, garantizando un comportamiento fail-closed.
- Verificacion de integridad en pipelines de ML: usar los receipts para comprobar que los artefactos generados (por ejemplo, .npz) no han sido alterados entre etapas.
- Investigacion en transparencia de IA: el paquete sirve como referencia de implementacion para mecanismos de gobernanza con receipts criptograficos y compuertas de abstencion.
- Sistemas de clasificacion con abstencion controlada: TinyKhipu-Nano puede integrarse en flujos donde una respuesta incierta debe abstenerse en lugar de arriesgar una prediccion erronea.
- Desarrollo de atencion con canales para datos estructurados: YARQA permite atender solo dentro de compartimentos contiguos, util para datos con segmentacion conocida (por ejemplo, canales de sensores o tramas de red).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que el repositorio no es un modelo de lenguaje. La model card incluye una tabla de "honest deltas" que compara cualitativamente cada componente con sistemas de referencia:

| Componente SZL | Referente | Delta honesto |
|---|---|---|
| TileReceipt | FlashAttention (NeurIPS 2022) | Silueta numerica de atencion fusionada por tiles; sin reclamacion de velocidad |
| BlockWitness | PagedAttention / vLLM (SOSP 2023) | Recoleccion de KV paginada con digesto de tabla de bloques; sin tokens/s |
| ScoreMod Fiber | FlexAttention (arXiv:2412.05496) | Ruta original de score_mod + block-mask con digesto de mascara; sin benchmarks CUDA |
| YARQA-ATTN | SageAttention (ICLR 2025) | No es atencion cuantizada; canales contiguos con cota de fuga; GPU no disponible |
| Governed RMSNorm | RMSNorm / LayerNorm | Coincide con una referencia y opcionalmente encadena un digesto; sin aceleracion |
| Λ-gate | UN HDI 2010 WGM / OECD | Media geometrica ponderada sobre [0,1] con fail-closed; unicidad abierta |
| govsign + provctl | in-toto / SLSA / Sigstore / DSSE | Envoltorio de predicados de gobernanza; confianza probada siempre falsa |

No se reportan metricas de latencia ni throughput.

## Requisitos de hardware

- CPU solamente: el paquete funciona con numpy puro; CUDA no esta disponible.
- Python >= 3.11, dependencia minima numpy>=1.26.
- Tamano del repositorio: 0.0 GB, por lo que los requisitos de almacenamiento son minimos.
- No requiere GPU; puede ejecutarse en cualquier maquina con Python y numpy.
- Opciones de despliegue: instalacion local via pip (`pip install -e .`), con extras opcionales para Gradio y torch.
- No se proporcionan estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No aplicable. Este repositorio no es un modelo de lenguaje ni un sistema de atencion completo comparable a LLMs como Qwen, Llama o Mistral. La model card advierte explicitamente que no es un fine-tune de Qwen, no es un modelo de 1.5B y no reimplementa FlashAttention ni vLLM. Como paquete de gobernanza de IA, podria compararse conceptualmente con frameworks como in-toto o SLSA, pero no se dispone de datos cuantitativos para una comparativa rigurosa en este ficha. Se recomienda no confundir este repositorio con SZLHOLDINGS/SZL-Khipu-1.5B, que es un modelo de lenguaje de tamano 1.5B publicado por la misma organizacion en otro repositorio.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta tool calling ni tiene capacidades de vision o audio.
- Confianza probada siempre falsa: `proven_trust` esta bloqueado a false; el sistema no ofrece garantias de confianza.
- Energia no disponible: no se reportan mediciones de consumo electrico (joules null), evitando fabricar datos.
- Unicidad del gate Λ abierta: la conjetura de unicidad no esta demostrada; la verificacion automatica bajo los axiomas A1-A4 es falsa.
- Sin soporte CUDA: no hay aceleracion por GPU, lo que limita su uso en cargas pesadas.
- No hereda benchmarks de los sistemas de referencia: las siluetas numericas no implican el rendimiento de FlashAttention, vLLM, FlexAttention, SageAttention, etc.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe respetar la atribucion y las condiciones de la licencia.
- Riesgo de confusion con otros repositorios de SZLHOLDINGS: existen modelos como SZL-Khipu-1.5B y SZL-Khipu-1.5B-GGUF que son LLMs diferentes; este repositorio no los entrena ni los publica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-khipu
- Fuente GitHub canonica: https://github.com/szl-holdings/szl-khipu
- Repositorio de kernels: https://huggingface.co/kernels/SZLHOLDINGS/szl-khipu-kernels
- Articulo de referencia (FlexAttention): arXiv:2412.05496
- Repositorio de consenso khipu (BFT): https://github.com/szl-holdings/khipu-consensus
- Forge SZL (entrenamiento de modelos): https://github.com/szl-holdings/szl-forge
