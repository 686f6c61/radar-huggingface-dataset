# SZLHOLDINGS/YARQA-ATTN

## Resumen

YARQA-ATTN es un kernel de atención original desarrollado por SZL Holdings, no un modelo de lenguaje. Su nombre proviene del quechua "yarqa" (canal de riego que divide el flujo) y su diseño se basa en una partición de la secuencia en canales o compartimentos contiguos, dentro de los cuales se realiza la atención. El kernel emite además un hash SHA3-256 tanto de la partición como de la salida de atención, lo que permite verificar la integridad del proceso. Se distribuye como paquete Python a través del Kernel Hub de Hugging Face, con licencia Apache-2.0.

La relevancia de este kernel radica en su enfoque de "plug-flow compartmentalization", que busca reducir la complejidad computacional de la atención al restringirla a segmentos contiguos, en lugar de la atención global típica de los transformers. Aunque no incluye pesos ni cubins de GPU (solo está disponible para CPU en esta versión), proporciona una implementación funcional y verificable mediante hashes. No debe confundirse con el repositorio homónimo de CFD (dinámica de fluidos computacional) de la misma organización, ni con otros kernels de atención como FlashAttention o FlexAttention.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de atención por compartimentos (compartment / plug-flow) |
| Parametros totales | no disponible (no es un modelo con pesos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la implementación del usuario) |
| Tipos de cuantizacion | no disponible (no aplica, es un kernel) |
| Idiomas soportados | code (Python) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no contiene tensores; paquete Python) |

## Arquitectura y entrenamiento

YARQA-ATTN no es un modelo entrenado, sino un kernel de atención que implementa una estrategia de partición de la secuencia en compartimentos contiguos (canales). Para cada compartimento se calcula la atención de forma independiente, y al final se emiten dos resúmenes SHA3-256: uno de la partición y otro de la salida de atención. Esta aproximación reduce el coste cuadrático de la atención global, aunque sacrifica la capacidad de atender a posiciones lejanas fuera del compartimento.

El kernel está escrito en Python y se carga mediante la función `get_kernel` del paquete `kernels` (versión 0.16.1). No se han publicado detalles sobre el entrenamiento, ya que no es un modelo de aprendizaje automático. La implementación se describe como una "original SZL cut" y se declara explícitamente que no copia código de Dao (FlashAttention), Sage, vLLM, cuDNN FMHA, TRT, CuTeDSL ni `flex_attention.py`. Toda afirmación sobre rendimiento o velocidad queda sin validar hasta que se realicen mediciones en hardware concreto; en la sesión de verificación solo se confirmó la importación en CPU y una diferencia máxima absoluta de 3.58e-07 frente a un compartimento de referencia.

## Capacidades

- Atención por compartimentos contiguos: particiona la secuencia en canales y calcula la atención dentro de cada uno.
- Emisión de recibos criptográficos: genera un hash SHA3-256 de la partición y de la salida de atención, permitiendo verificar la integridad del cómputo.
- Importación en CPU: funciona mediante `get_kernel` en entornos sin GPU, con backend `torch-universal` (por defecto) o `torch-cpu`.
- Integración con PyTorch: el kernel se ejecuta sobre tensores de PyTorch (se ha probado con torch 2.13.0+cu130 en CPU).
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling, al ser un kernel de bajo nivel.

## Casos de uso

- Verificación de integridad en pipelines de atención: al emitir hashes SHA3-256 de la partición y de la salida, el kernel permite auditar que el cómputo de atención no ha sido alterado, útil en entornos con requisitos de trazabilidad.
- Investigación en atención eficiente: sirve como base para estudiar el impacto de restringir la atención a compartimentos contiguos sobre la calidad del modelo y el coste computacional.
- Prototipado de arquitecturas de atención alternativas: los desarrolladores pueden integrar este kernel en sus propios transformers para experimentar con la partición en canales sin necesidad de implementar kernels CUDA personalizados.
- Entornos sin GPU: al ser un kernel puro de CPU, permite ejecutar experimentos de atención en máquinas sin aceleradores gráficos, aunque con menor rendimiento.
- Auditoría de modelos: los recibos hash pueden emplearse para certificar que una determinada salida de atención se generó con una partición concreta, facilitando la reproducibilidad.
- Enseñanza de mecanismos de atención: su código Python legible y su diseño conceptual (canales, flujo) pueden utilizarse como material didáctico en cursos sobre arquitecturas de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay mediciones de tokens por segundo ni de consumo energético ("no tokens/s; no joules"), y que toda afirmación de velocidad queda sin validar hasta que se realicen pruebas en hardware específico. La única métrica reportada es la diferencia máxima absoluta de 3.58e-07 frente a un compartimento de referencia en CPU, lo que sugiere una implementación numéricamente estable, pero no constituye un benchmark de rendimiento.

## Requisitos de hardware

- CPU: funciona en procesadores x86_64 (probado en un Intel Xeon de 8 núcleos con Linux 6.12.94+).
- GPU: no requiere GPU; de hecho, los cubins de GPU no están disponibles en esta versión. `torch.cuda.is_available()` devuelve `false` en la sesión de verificación.
- Memoria: no se especifica un consumo mínimo de RAM, pero al ser un kernel de atención, dependerá del tamaño de la secuencia y del número de compartimentos.
- Despliegue: se carga mediante `get_kernel` del paquete `kernels` (versión 0.16.1). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han realizado mediciones en hardware.

## Comparativa con modelos similares

No se dispone de información sobre kernels de atención directamente comparables en la documentación proporcionada. El autor menciona explícitamente que no es una cuarta variante de FlashAttention, FlexAttention ni de los kernels paginados de vLLM, y que no debe listarse junto a otros kernels de SZL (Chaski, Qantu, Waman, Chakana, Tinku). Tampoco es un alias de `szl-receipt-attn`. Por tanto, no se puede establecer una comparativa objetiva con alternativas sin datos adicionales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: YARQA-ATTN es un kernel de atención, no contiene pesos ni puede generar texto. Su uso requiere integrarlo en un framework más amplio.
- GPU no disponible: los cubins de GPU no están incluidos en esta versión; solo se ha verificado la importación en CPU. El rendimiento en GPU no está garantizado ni documentado.
- Sin mediciones de rendimiento: no hay datos de tokens por segundo, latencia ni consumo energético. Cualquier afirmación sobre velocidad es especulativa.
- Alcance limitado de la atención: al restringir la atención a compartimentos contiguos, no se modelan dependencias de largo alcance entre posiciones de distintos canales, lo que puede degradar la calidad en tareas que requieran contexto global.
- Dependencia del paquete `kernels`: el kernel requiere la infraestructura de Kernel Hub (`kernels` 0.16.1) y el uso de `trust_remote_code=True`, lo que implica ejecutar código remoto con los riesgos de seguridad asociados.
- No es un producto oficial de SZL para producción: la model card indica que el laboratorio de inferencia en vivo es otro espacio (`szl-model-inference-lab`) y que este repositorio no es el "serve studio". Se recomienda precaución antes de usarlo en entornos productivos.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/YARQA-ATTN
- GitHub (fuente de verdad): https://github.com/szl-holdings/YARQA-ATTN
- Repositorio CFD homónimo (no confundir): https://github.com/szl-holdings/yarqa
- Perfil de la organización en HuggingFace: https://huggingface.co/SZLHOLDINGS/models
- Laboratorio de inferencia en vivo (solo GGUF Khipu): https://huggingface.co/spaces/SZLHOLDINGS/szl-model-inference-lab
