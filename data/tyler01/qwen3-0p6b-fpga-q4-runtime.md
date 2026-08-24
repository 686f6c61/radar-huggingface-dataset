# Tyler01/qwen3-0p6b-fpga-q4-runtime

## Resumen

Este repositorio contiene el runtime FPGA Q4 del modelo Qwen3-0.6B-Base, preparado específicamente para la demo de placa `qwen3-0p6b-q4-qweb-demo` del proyecto GitHub `Tyler913/LLM_Accelerator`. No es un checkpoint estándar de Transformers, ni un GGUF, ONNX o paquete LMDeploy; se trata de una imagen de runtime preempaquetada para la memoria PL-DDR de una FPGA Xilinx, con un formato propietario QMAP/Q4.

El modelo base es Qwen3-0.6B-Base, un transformer denso de 0.6 mil millones de parámetros desarrollado por Alibaba, que forma parte de la familia Qwen3. La relevancia de este artefacto radica en que demuestra la viabilidad de ejecutar un LLM cuantizado en hardware FPGA, un enfoque que puede ofrecer ventajas en latencia, consumo energético y coste frente a GPUs en entornos embebidos o de borde. Sin embargo, su uso está estrictamente limitado al hardware y software específicos descritos en el proyecto, y no es consumible por frameworks de inferencia genéricos.

El repositorio contiene 61 segmentos binarios (`qwen3_runtime_00.bin` a `qwen3_runtime_60.bin`) que suman 394 547 200 bytes, con cuantización Q4 por grupos simétricos de 64 pesos. La licencia es Apache-2.0 y se mantiene la atribución al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B-Base) |
| Parametros totales | 0.6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3 soporta 32 768 tokens, pero el runtime FPGA puede tener limitaciones no documentadas) |
| Tipos de cuantizacion | Q4 (grupos simetricos de 64 pesos, formato QMAP/Q4 propietario) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Binario propietario QMAP/Q4 (segmentos `qwen3_runtime_*.bin`), no compatible con safetensors, GGUF ni ONNX |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B-Base, un transformer denso de 0.6 mil millones de parámetros con 28 capas, entrenado por Alibaba dentro de la serie Qwen3. La familia Qwen3 incluye modelos densos y MoE, con tamaños de 0.6B a 235B, e introduce un modo de pensamiento (thinking) y un modo sin pensamiento (non-thinking) unificados en un solo modelo. El modelo base fue preentrenado con un corpus multilingüe extenso, aunque los detalles exactos del dataset no se especifican en la información disponible.

El runtime de este repositorio no es un modelo reentrenado, sino una conversión del checkpoint base a cuantización Q4 con un layout personalizado QMAP/Q4, diseñado para ser cargado en la memoria PL-DDR de una FPGA Xilinx mediante un loader XSDB personalizado. No se documenta ningún proceso de fine-tuning, RLHF ni DPO sobre el modelo base. La cuantización agrupa los pesos en bloques simétricos de 64, lo que reduce el tamaño total a aproximadamente 394 MB.

## Capacidades

- Ejecución de inferencia del modelo Qwen3-0.6B-Base en hardware FPGA Xilinx, exclusivamente con el bitstream y el software de la demo `qwen3-0p6b-q4-qweb-demo`.
- Cuantización Q4 con agrupación de 64 pesos, optimizada para el acelerador QWEB de la FPGA.
- El runtime incluye los datos necesarios para la imagen completa de 28 capas del modelo.
- No es un modelo de lenguaje usable directamente: no incluye tokenizador ni configuración estándar, y no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido habitual, ya que solo funciona dentro del entorno FPGA específico.
- No se puede cargar con Transformers, llama.cpp, vLLM, Ollama ni ningún otro framework de inferencia genérico.

## Casos de uso

- Demo de aceleración de LLM en FPGA: el caso de uso principal es demostrar la viabilidad de ejecutar un LLM cuantizado en una FPGA Xilinx, sirviendo como referencia para investigación y desarrollo de aceleradores de hardware de bajo consumo.
- Prototipado de sistemas embebidos con IA generativa: para equipos que desarrollan soluciones de borde con restricciones de energía o coste, este runtime muestra un camino para integrar un LLM de 0.6B en un dispositivo FPGA sin depender de GPUs.
- Evaluación de cuantización Q4 en hardware: los segmentos y el manifest de verificación permiten auditar el proceso de conversión y validar la integridad de los pesos cuantizados en un flujo de hardware.
- Investigación en compilación de modelos para hardware: el formato QMAP/Q4 y el manifest de direcciones PL-DDR son útiles para estudiar cómo se mapean los pesos de un transformer a memoria física en un acelerador.
- Desarrollo de herramientas de verificación de artefactos de IA en FPGA: los scripts `download_q4_runtime.py` y `verify_q4_runtime.py` del proyecto GitHub sirven como plantilla para gestionar y auditar paquetes de runtime en entornos de hardware.
- Formación en flujos de despliegue de IA en FPGA: el proyecto completo documenta el proceso desde la descarga del runtime hasta la auditoría de la placa, útil como caso de estudio académico o industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se realiza ninguna afirmación de rendimiento. No hay datos de MMLU, HumanEval, GSM8K ni latencia/throughput para este runtime FPGA.

## Requisitos de hardware

- FPGA Xilinx compatible con el bitstream y la aplicación de la demo `qwen3-0p6b-q4-qweb-demo` (no se especifica el modelo exacto de FPGA en la información proporcionada).
- Memoria PL-DDR con al menos 394 547 200 bytes para los segmentos del runtime.
- Loader XSDB personalizado y el software de la demo del repositorio GitHub `Tyler913/LLM_Accelerator`.
- No es compatible con GPUs ni CPUs; no requiere VRAM.
- El despliegue se realiza mediante el script `run_demo.ps1` con el flag `-AuditOnly` para verificación sin hardware.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este artefacto no es un modelo de lenguaje estándar, sino un runtime FPGA específico para un único modelo base (Qwen3-0.6B-Base). No existen alternativas comparables en el mismo formato, ya que el formato QMAP/Q4 y el acelerador QWEB son propietarios de este proyecto. Para comparar el modelo base Qwen3-0.6B con otros LLMs de tamaño similar, se puede consultar la documentación oficial de Qwen3, pero no se dispone de datos de rendimiento para esta versión FPGA.

## Limitaciones y advertencias

- No es un checkpoint estándar: no puede ser cargado por Transformers, GGUF, ONNX, LMDeploy ni ningún framework de inferencia genérico. Intentar usarlo fuera del entorno FPGA específico fallará.
- Dependencia total del hardware: requiere el bitstream, el mapa de direcciones, la cuantización y el software de build exactos del proyecto `Tyler913/LLM_Accelerator`. Mezclar segmentos con otra versión del bitstream o del software invalidará el runtime.
- Sin tokenizador ni configuración: el repositorio no incluye los archivos necesarios para ejecutar el modelo en un pipeline estándar de NLP.
- Estado de validación: la model card indica que los artefactos originales pasaron un flujo físico de placa, pero el nuevo envoltorio portátil y la estructura de directorios requieren una nueva validación en placa física antes de ser etiquetados como "aceptados por placa".
- Sin garantía de rendimiento: no se hacen afirmaciones sobre latencia, throughput ni calidad de las respuestas.
- Riesgo de alucinación y sesgos: al derivar de Qwen3-0.6B-Base, el modelo puede presentar los sesgos y limitaciones típicos de los LLMs de pequeño tamaño, pero no hay datos específicos para esta versión FPGA.
- Restricciones de licencia: aunque la licencia es Apache-2.0, la redistribución debe conservar la atribución al modelo base y la información de licencia. El uso comercial está permitido, pero sujeto a los términos de Apache-2.0 y a la dependencia del proyecto GitHub.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tyler01/qwen3-0p6b-fpga-q4-runtime
- Proyecto GitHub (fuente, artefactos de placa, lanzador y manifiestos): https://github.com/Tyler913/LLM_Accelerator/tree/main/lmdeploy/qwen3-0p6b-q4-qweb-demo
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Paper técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Guía completa de Qwen3 (insiderllm.com): https://insiderllm.com/guides/qwen3-complete-guide/
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
