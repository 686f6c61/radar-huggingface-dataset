# StructBench/deforming-plate

## Resumen

StructBench/deforming-plate es un checkpoint de referencia del benchmark StructBench, un conjunto de evaluación para modelos sustitutos (surrogate models) en ingeniería estructural. Lo publica la organización StructBench como parte de la release de código v0.4.0 (cláusula 8 del ADR-0074). El modelo concreto corresponde a la fila MGN (MeshGraphNet), un esquema autorregresivo entrenado para predecir la deformación de una placa sometida a carga.

El repositorio no contiene un modelo de lenguaje ni un transformer generativo: es un checkpoint de PyTorch (`.pt`) pensado para ejecutarse con la herramienta de línea de comandos `structbench-train` del repositorio GitHub del proyecto. Cada carpeta del bundle incluye el checkpoint registrado, el `config.json` resuelto, las estadísticas de normalización cuando el modelo las usa, los ficheros `metrics-<split>.json` de los splits evaluados y un `SHA256SUMS` que cubre todos esos ficheros.

Su relevancia es acotada pero clara: sirve como referencia reproducible para comparar modelos sustitutos de simulación física en el problema `deforming_plate`. El resultado principal publicado es un `rollout_rel_l2_disp` de 0,5013 en test. El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere que los pesos aún no se han subido o son muy pequeños. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MGN (MeshGraphNet), esquema autorregresivo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, fichero `model-best-1750000.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la familia MGN (MeshGraphNet), una arquitectura de red neuronal sobre grafos diseñada para simular sistemas físicos representados como mallas. En este caso se aplica al benchmark `deforming_plate`, que modela la deformación de una placa. El esquema es autorregresivo: el modelo predice el siguiente estado a partir del estado actual y lo realimenta, de modo que la evaluación se hace en modo *rollout* (despliegue de la trayectoria completa) y no solo en predicción de un paso.

El checkpoint se identifica como `model-best-1750000.pt`, lo que sugiere un entrenamiento de al menos 1.750.000 pasos o iteraciones. El commit de ejecución es `eb39994`, con fecha de ejecución 2026-08-17. No se dispone de información sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO, que no aplican a este tipo de modelo. La evaluación se realiza con el comando `structbench-train --mode rollout`, que reconstruye el simulador a partir del `config.json` incluido en el propio bundle.

## Capacidades

- Predicción de la deformación de una placa bajo carga mediante simulación autorregresiva sobre malla.
- Modelo sustituto (surrogate) de un simulador físico: aproxima resultados de simulación sin ejecutar el solver completo.
- Evaluación en modo *rollout*: predice trayectorias completas, no solo un paso.
- Normalización de entradas y salidas mediante estadísticas incluidas en el bundle cuando el modelo las usa.
- Verificación de integridad de los ficheros mediante `SHA256SUMS`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso lingüístico ni capacidades multilingües.
- No es un modelo de visión, audio ni generación de texto.

## Casos de uso

- Evaluación reproducible de modelos sustitutos: sirve como referencia fija contra la que comparar nuevas arquitecturas en el problema `deforming_plate`, usando el mismo `config.json` y el mismo comando de evaluación.
- Aceleración de estudios paramétricos: sustituir el solver de elementos finitos por el MGN para explorar rápidamente configuraciones de carga y geometría en fase de diseño conceptual.
- Validación de pipelines de simulación: comprobar que la infraestructura de entrenamiento y evaluación de StructBench funciona correctamente antes de lanzar experimentos propios.
- Investigación en aprendizaje sobre mallas: usar el checkpoint como punto de partida o como línea base en trabajos sobre MeshGraphNet y modelos autorregresivos para física.
- Docencia en métodos numéricos y machine learning científico: ilustrar cómo se entrena y evalúa un surrogate model con métricas de error relativo L2 en desplazamiento.
- Reproducibilidad de publicaciones: citar el checkpoint y su SHA-256 para que terceros verifiquen los resultados del benchmark sin reentrenar.

## Benchmarks y rendimiento

| Modelo | Split | Métrica | Valor |
|---|---|---|---|
| MGN (`eb39994`) | test | `rollout_rel_l2_disp` | 0,5013 |

No se han publicado resultados de benchmarks adicionales en la información disponible. No hay comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0,0 GB, por lo que los pesos podrían no estar subidos o ser muy pequeños; sin conocer el número de parámetros no se puede estimar la VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía documentada es la CLI `structbench-train` del repositorio GitHub, que reconstruye el simulador desde el `config.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de StructBench ni modelos sustitutos comparables con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos; conviene verificar el contenido antes de usarlo.
- El resultado publicado (`rollout_rel_l2_disp` de 0,5013) indica un error relativo alto en el despliegue autorregresivo; no debe interpretarse como un modelo de precisión de producción sin validación adicional.
- El modelo es específico del problema `deforming_plate`; no generaliza a otras geometrías o condiciones de contorno sin reentrenamiento.
- La evaluación sobrescribe el `metrics-<split>.json` descargado; hay que conservar una copia para comparar.
- Es imprescindible verificar los ficheros contra `SHA256SUMS` antes de confiar en ellos.
- No hay información sobre sesgos, alucinación o limitaciones de idioma porque no es un modelo lingüístico.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se desconoce si el dataset canónico de casos tiene restricciones adicionales.
- No se documentan requisitos de hardware ni tiempos de inferencia, lo que dificulta planificar su despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/StructBench/deforming-plate
- Repositorio de código y definiciones del benchmark: https://github.com/qilinli/StructBench
- Registro de resultados del benchmark: https://github.com/qilinli/StructBench/blob/v0.4.0/docs/benchmarks/deforming_plate.md
