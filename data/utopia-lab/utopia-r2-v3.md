# utopia-lab/utopia-r2-v3

## Resumen

Utopia-r2-v3 es un modelo de lenguaje publicado por utopia-lab en Hugging Face bajo licencia Apache 2.0 y acceso restringido (gated). Los metadatos lo etiquetan como derivado de la familia Gemma 4, con pesos en formato safetensors y un total de 31.273.088.876 parametros (aproximadamente 31,3 mil millones). El repositorio ocupa 62,6 GB, lo que es coherente con pesos en precision de 16 bits para ese numero de parametros.

El modelo aparece como una variante de la serie "utopia-r2", presumiblemente un ajuste o derivado de un modelo base Gemma 4 de tamano medio-grande. No obstante, la informacion publica disponible en Hugging Face es minima: no se declaran idiomas soportados, no hay pipeline definido, no se han publicado descargas ni interacciones, y no se incluyen resultados de benchmarks en la informacion proporcionada.

Su relevancia actual es limitada desde el punto de vista de evaluacion, ya que se trata de un modelo recien creado (noviembre de 2026) sin documentacion tecnica asociada en los datos disponibles. Cualquier uso en produccion requeriria primero solicitar acceso y validar empiricamente sus capacidades, ya que no existe evidencia publica de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como gemma4) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el esquema de atencion, la presencia de mezcla de expertos o cualquier innovacion estructural en los datos disponibles. La unica referencia es la etiqueta "gemma4", que sugiere que el modelo deriva de la familia Gemma 4 de Google, pero no se especifica si se trata de un fine-tuning, una destilacion o un modelo entrenado desde cero sobre esa arquitectura.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre procesos de decodificacion especulativa o atencion lineal. Toda esta seccion queda como no disponible a la espera de que el autor publique una model card detallada.

## Capacidades

- Generacion de texto: capacidad esperable por tratarse de un modelo de lenguaje de ~31 B, aunque no verificada en la informacion disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Evaluacion comparativa interna: dado que no hay benchmarks publicos, un equipo puede solicitar acceso y ejecutar su propia bateria de pruebas (MMLU, GSM8K, HumanEval) para decidir si el modelo encaja en su stack, aprovechando que la licencia Apache 2.0 permite uso comercial.
- Fine-tuning especifico de dominio: con ~31 B de parametros y pesos safetensors, es viable aplicar LoRA o QLoRA sobre datos propios (legal, sanitario, financiero) para adaptar el modelo a una tarea concreta, siempre que el acceso gated se conceda.
- Prototipado de asistentes conversacionales: el tamano permite desplegarlo en una unica GPU de 80 GB en fp16, lo que facilita montar un prototipo de chatbot multi-turno antes de invertir en infraestructura mayor.
- Generacion aumentada por recuperacion (RAG): al ser un modelo de lenguaje generalista, puede integrarse como generador en un pipeline RAG, aunque la longitud de contexto debe medirse empiricamente al no estar declarada.
- Investigacion sobre derivados de Gemma 4: util para estudiar como se comporta un ajuste comunitario de la familia Gemma 4 frente al modelo base original, comparando calidad y sesgos.
- Despliegue on-premise con requisitos de licencia permisiva: la licencia Apache 2.0 y el formato safetensors facilitan su integracion en entornos corporativos que no aceptan licencias con restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda una GPU con 80 GB (A100 80GB, H100 80GB) para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 32-35 GB, viable en A100 40GB o en configuraciones multi-GPU consumer.
- VRAM estimada en cuantizacion de 4 bits: en torno a 18-20 GB, lo que permitiria ejecutarlo en una RTX 4090 (24 GB) o RTX 3090, siempre que existan pesos GGUF/AWQ disponibles (no confirmado).
- GPU recomendadas: A100 80GB, H100 80GB para fp16; RTX 4090 o A6000 para cuantizaciones bajas.
- Opciones de despliegue: vLLM, TGI y llama.cpp son candidatos habituales para safetensors, pero no se confirma compatibilidad en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks publicos |
|---|---|---|---|---|---|
| utopia-r2-v3 | ~31,3 B | no disponible | Apache 2.0 | Gated | no disponible |
| Gemma 2 27B | 27 B | 8K | Gemma license | Abierto | Si |
| Qwen2.5 32B | 32,5 B | 128K | Apache 2.0 | Abierto | Si |
| Mistral Small 24B | 24 B | 32K | Apache 2.0 | Abierto | Si |

La comparativa se basa en el tamano y la licencia, no en rendimiento, ya que utopia-r2-v3 no publica metricas. Los modelos alternativos de la tabla cuentan con documentacion y evaluaciones publicas, lo que los hace mas fiables para decisiones de produccion a dia de hoy.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, sesgos ni alineamiento, lo que impide evaluar riesgos.
- Riesgo de alucinacion desconocido: al no haber evaluaciones publicas, no se puede estimar su tasa de alucinacion.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de otros idiomas sin pruebas empiricas.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que anade friccion a cualquier evaluacion o despliegue.
- Sin descargas ni likes: el modelo no tiene traccion comunitaria, por lo que no existen reportes independientes de calidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar si el modelo base Gemma 4 impone condiciones adicionales que el autor no haya reflejado.
- Compatibilidad de cuantizaciones no confirmada: no hay pesos GGUF ni AWQ publicados, lo que puede limitar el despliegue en hardware consumer.

## Enlaces

- Hugging Face: https://huggingface.co/utopia-lab/utopia-r2-v3
