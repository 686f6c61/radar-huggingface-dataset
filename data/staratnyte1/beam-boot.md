# StarAtNyte1/beam-boot

## Resumen

Beam Boot es un repositorio experimental de investigación, publicado por el usuario StarAtNyte1 en Hugging Face, cuyo objetivo es ejecutar una CPU mínima y un monitor arrancable dentro de los pases forward de un modelo de atención. No se trata de un modelo de lenguaje preentrenado ni de un checkpoint listo para usar, sino de una colección de prototipos que exploran si un mecanismo de atención puede comportarse como una unidad central de proceso. El autor lo describe explícitamente como "research in progress": no existe un sistema operativo de propósito general ni un checkpoint de Beam modificado.

El proyecto se organiza en varios módulos incrementales: una memoria de atención tensorial, dos CPUs neuronales compiladas a partir de tablas de verdad, un esbozo escalar de atención, una CPU respaldada por atención con ROM fija, una CPU de eventos causales con monitor ROM de 256 instrucciones y, finalmente, un backend que utiliza las clases reales `BeamAttention` y `DynamicCache` de Hugging Face Transformers con pesos construidos a mano. La relevancia actual es puramente investigadora: explora los límites de la atención como sustrato computacional y la frontera entre circuitos finitos exactos y modelos neuronales entrenados.

No hay información sobre arquitectura de modelo desplegable, tamaño de parámetros, contexto, idiomas ni licencia. Cualquier uso en producción está fuera del alcance de este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Módulos de atención experimentales (SDPA, `BeamAttention` de HF) y MLP con pesos construidos a partir de tablas de verdad; no es un transformer estándar |
| Parámetros totales | No disponible (pesos construidos a mano, no entrenados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el monitor ROM usa 256 instrucciones y 16 posiciones de RAM de 4 bits |
| Tipos de cuantización | No disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | No disponible (código Python y pesos generados en tiempo de ejecución; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

El proyecto no entrena ningún modelo. Todos los pesos se construyen de forma determinista a partir de tablas de verdad específicas de cada programa, o se generan mediante código Python anfitrión. Los módulos principales son: `tensor_memory.py`, que usa `scaled_dot_product_attention` de PyTorch para implementar una memoria direccionable con señal de recencia; `cpu.py` y `machine.py`, que compilan dos redes feed-forward pequeñas con acumulador de 4 bits, contador de programa de 4 bits, una celda de RAM de 4 bits e instrucciones de salto; `attention_cpu.py` y `monitor.py`, que conectan un circuito ReLU específico de ROM a una RAM direccionada por SDPA con 16 posiciones de 4 bits y 32 instrucciones de ROM; `sequence_cpu.py`, `large_cpu.py` y `os.py`, que implementan una CPU de eventos causales con 256 instrucciones de ROM, acumulador de 4 bits y 16 posiciones de RAM de 4 bits; y `hf_beam_attention.py` y `hf_beam_cpu.py`, que usan las implementaciones reales `BeamAttention` y `DynamicCache` de Hugging Face Transformers con un grupo de seis cabezas de consulta y una cabeza KV de 128 dimensiones, ruta de atención completa sin codificación posicional (NoPE), normalización RMS de Q/K, escalado de consulta dependiente de posición y puerta sigmoide de atención.

La innovación técnica destacable es el uso de atención como memoria direccionable y como circuito combinacional: cada pase forward avanza una instrucción, el host serializa los eventos de escritura y ejecuta la E/S, y el modelo emite señales de escritura y salida. El autor advierte que la construcción escala exponencialmente con el tamaño del estado, que la ROM se compila en un MLP de tabla de verdad grande, que la precisión finita y el presupuesto finito de eventos limitan la exactitud, y que el backend con `BeamAttention` no usa la arquitectura ni el checkpoint propios de Beam. No hay datos sobre volumen de tokens de entrenamiento, composición del dataset ni RLHF/DPO porque no hay entrenamiento.

## Capacidades

- Ejecución de un monitor ROM mínimo con comandos `help`, `version`, `add 7 8` y `quit`; la suma es módulo 16.
- Memoria direccionable implementada con atención tensorial y señal de recencia acotada.
- CPUs neuronales compiladas que avanzan una instrucción por pase forward, con acumulador, contador de programa, RAM y saltos.
- CPU respaldada por atención con ROM fija de 32 instrucciones y 16 posiciones de RAM de 4 bits.
- CPU de eventos causales con ROM de 256 instrucciones, soporte de inferencia de secuencia completa y de consulta única.
- Backend con `BeamAttention` real de Hugging Face, con caché KV actualizada incrementalmente.
- E/S mapeada en memoria mediante tokens de dispositivo gestionados por el host.
- No soporta tool calling, function calling, agentes, razonamiento multi-step general, capacidades multilingües, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre atención como sustrato computacional: el módulo `tensor_memory.py` permite estudiar si la atención con softmax puede implementar una memoria direccionable con recencia, comparando 256 actualizaciones sembradas contra una referencia tipo diccionario.
- Docencia y divulgación sobre máquinas de estados finitos: las CPUs compiladas de `cpu.py` y `machine.py` ilustran cómo una red feed-forward con pesos derivados de tablas de verdad puede reproducir un intérprete de referencia para los 8.192 estados no detenidos de un programa.
- Validación de implementaciones de atención: `hf_beam_attention.py` usa las clases reales `BeamAttention` y `DynamicCache` de Transformers, lo que permite comparar el comportamiento de una atención con NoPE, normalización RMS y puerta sigmoide frente a un intérprete independiente en Python.
- Experimentos de arranque simbólico: el monitor `beamboot.os` sirve para probar protocolos de E/S mapeada en memoria y serialización de eventos entre un host Python y un circuito de atención.
- Pruebas de exactitud numérica: los tests del repositorio comparan actualizaciones y estados contra referencias deterministas, útiles para estudiar los límites de la precisión finita y del presupuesto de escritura en mecanismos de atención.
- Prototipado de arquitecturas híbridas atención-MLP: los módulos `sequence_cpu.py` y `large_cpu.py` permiten explorar cómo se proyectan claves y valores desde vectores de evento estructurados y cómo se recalcula la historia en cada paso sin caché KV optimizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El autor documenta una instalación CPU-only con Python 3.10+ y PyTorch, usando `uv` para crear un entorno virtual e instalar `torch` desde el índice CPU y `transformers>=5.20.1,<6`.
- No se especifican requisitos de VRAM ni GPU recomendadas; el proyecto está pensado para ejecutarse en CPU con `OMP_NUM_THREADS=1`.
- No hay datos sobre si cabe en GPU de consumo, latencia o throughput.
- Opciones de despliegue: ejecución directa como módulo Python (`python -m beamboot.demo`, `python -m beamboot.os`) y tests con `unittest`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- El runtime de la CPU de eventos causales recalcula claves y valores desde el historial de eventos en cada paso, en lugar de usar una caché KV optimizada de transformer.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría, dado que Beam Boot no es un modelo de lenguaje ni un checkpoint preentrenado, sino un conjunto de prototipos de investigación sobre atención como sustrato de cómputo.

## Limitaciones y advertencias

- No es un sistema operativo de propósito general ni un checkpoint de Beam modificado; el propio autor lo califica de investigación en curso.
- Los pesos son construidos a mano, no entrenados, por lo que no hay capacidad de generalización fuera de los programas para los que se compilaron las tablas de verdad.
- La construcción escala exponencialmente con el tamaño del estado, lo que limita su aplicabilidad a máquinas grandes.
- La precisión finita y el presupuesto finito de eventos impiden garantizar exactitud para todas las configuraciones; una ventana deslizante puede desalojar memoria antigua y devolver valores incorrectos.
- El esquema de memoria requiere un rango de puntuaciones de dirección proporcional al presupuesto de escritura y debe probarse con la atención, codificación posicional, caché y hardware reales de Beam.
- La ganancia de normalización de Q está construida específicamente para esta máquina de juguete y no proviene de Beam.
- No hay información sobre licencia, sesgos, alucinación o restricciones de uso comercial; al no ser un modelo de lenguaje, estas categorías no aplican de forma directa, pero la ausencia de licencia impide asumir permisos de uso.
- El backend con `BeamAttention` no usa el decodificador ni el checkpoint de Beam, solo sus clases de atención.

## Enlaces

- [Hugging Face: StarAtNyte1/beam-boot](https://huggingface.co/StarAtNyte1/beam-boot)
