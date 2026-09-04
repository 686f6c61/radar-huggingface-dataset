# zimmeryWo/MRI-sCT_converter-DoseRAD2026

## Resumen

El modelo `zimmeryWo/MRI-sCT_converter-DoseRAD2026` es un componente de inteligencia artificial desarrollado por el usuario `zimmeryWo` (LukasZ) para el ámbito de la radioterapia. Su función principal, tal como indica su nombre, es la conversión de imágenes de resonancia magnética (MRI) en tomografías computarizadas sintéticas (sCT). Este tipo de modelos es relevante en la planificación de tratamientos oncológicos, porque permite obtener la información de atenuación necesaria para el cálculo de dosis sin necesidad de realizar una CT adicional, reduciendo así la exposición a radiación del paciente.

El modelo está vinculado al desafío DoseRAD2026, organizado en el marco de MICCAI 2026, que aborda el cálculo de dosis de fotones y protones en tiempo real sobre CT y MRI. La información publicada en la model card de Hugging Face es mínima: solo se indica la licencia Apache 2.0. No se dispone de datos sobre la arquitectura, el número de parámetros, la longitud de contexto ni el formato de pesos. Por tanto, la ficha técnica es limitada y debe interpretarse como una referencia inicial para investigaciones en el campo de la física médica y la planificación de tratamientos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información técnica detallada sobre la arquitectura del modelo, los datos de entrenamiento ni las técnicas de optimización utilizadas. El nombre del modelo y su asociación con el desafío DoseRAD2026 permiten inferir que se trata de un sistema de aprendizaje profundo para síntesis de imágenes médicas, orientado a la generación de CT sintéticos a partir de MRI. Sin embargo, no se puede confirmar si la arquitectura se basa en redes generativas adversarias, modelos de difusión u otro enfoque. Tampoco se dispone de datos sobre el número de tokens, la composición del dataset, ni sobre procesos de alineación como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Conversión de imágenes de resonancia magnética (MRI) a tomografías computarizadas sintéticas (sCT).
- Diseñado para apoyar el cálculo de dosis en radioterapia, tanto de fotones como de protones, según el contexto del desafío DoseRAD2026.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, razonamiento multi-step en el sentido de agentes conversacionales ni capacidades multilingües.
- No se dispone de información sobre modos especiales como visión, audio o thinking mode.

## Casos de uso

- Planificación de radioterapia: el modelo permite generar un CT sintético a partir de una MRI del paciente, lo que facilita el cálculo de dosis sin necesidad de adquirir una CT de planificación adicional. Esto es especialmente útil en pacientes donde se busca minimizar la radiación diagnóstica.
- Adaptación de tratamientos (ART): en flujos de trabajo de radioterapia adaptativa, la MRI diaria puede convertirse en sCT para recalcular la dosis y ajustar el plan de tratamiento en tiempo real.
- Investigación en física médica: el modelo puede utilizarse para estudiar la precisión de algoritmos de cálculo de dosis cuando se emplean CT sintéticos en lugar de CT reales, contribuyendo a la validación de nuevas técnicas.
- Integración en sistemas de planificación de tratamiento: puede incorporarse como módulo en pipelines clínicos que necesiten convertir imágenes de MRI a mapas de atenuación para planificadores de dosis.
- Reducción de la exposición a radiación: al evitar una CT de planificación, se reduce la dosis acumulada de radiación al paciente, lo que resulta relevante en tratamientos pediátricos o en pacientes con múltiples estudios.
- Formación y simulación: permite generar datasets de CT sintéticos a partir de MRI para entrenar otros modelos de cálculo de dosis o para realizar simulaciones en entornos educativos.
- Participación en el desafío DoseRAD2026: el modelo puede ser un componente de una solución completa para las tareas 3 y 4 del desafío, centradas en el cálculo de dosis en tiempo real sobre CT y MRI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información sobre los requisitos de hardware. No se puede estimar la VRAM necesaria para inferencia ni las GPU recomendadas, ya que se desconocen la arquitectura y el tamaño del modelo. Tampoco hay datos de latencia o throughput. Las opciones de despliegue habituales para modelos de síntesis de imágenes médicas incluyen frameworks como PyTorch, TensorFlow o MONAI, pero no se puede confirmar la compatibilidad sin documentación técnica.

## Comparativa con modelos similares

No disponible. El autor tiene otro modelo publicado en Hugging Face con el nombre `zimmeryWo/simcbctgenerator-sct-model-PELVIS`, que también parece estar relacionado con la generación de CT sintéticos a partir de MRI. Sin embargo, no se dispone de especificaciones de ese modelo para realizar una comparación rigurosa de parámetros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgo de alucinación o limitaciones de contexto e idioma, al no ser un modelo de lenguaje.
- La model card está vacía, lo que implica una documentación técnica muy limitada. Esto dificulta la evaluación del rendimiento, la fiabilidad y la reproducibilidad del modelo.
- Es un modelo orientado a la investigación en física médica. Antes de cualquier uso clínico, debe someterse a una validación exhaustiva y al cumplimiento de las normativas sanitarias aplicables.
- La licencia Apache 2.0 permite el uso comercial, pero se recomienda revisar las implicaciones legales y regulatorias en el ámbito médico, especialmente en lo relativo a la responsabilidad sobre decisiones de tratamiento.
- No se puede confirmar la arquitectura ni los datos de entrenamiento, por lo que la fiabilidad del modelo para casos de uso reales no puede evaluarse a partir de la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/zimmeryWo/MRI-sCT_converter-DoseRAD2026
- Perfil del autor en Hugging Face: https://huggingface.co/zimmeryWo
- Repositorio del desafío DoseRAD2026: https://github.com/thaingocdiep0405-cmd/doserad2026
