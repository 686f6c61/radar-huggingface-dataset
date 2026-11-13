# TrueSavage/EdenGNN

## Resumen

EdenGNN (Equivariant Density Graph Neural Network) es un modelo de aprendizaje automático sobre grafos orientado a la predicción de densidades de carga electrónica a partir de estructuras atómicas. Lo desarrolla el autor identificado como TrueSavage y se distribuye como un conjunto de checkpoints preentrenados asociados al artículo *Efficient equivariant framework for universal charge density prediction*. No es un modelo de lenguaje: su pipeline en Hugging Face es `graph-ml` y su propósito es acoplarse a flujos de trabajo DFT (teoría del funcional de la densidad) para acelerar cálculos de estructura electrónica.

El repositorio contiene checkpoints universales entrenados sobre la base de datos Materials Project para materiales no magnéticos, con variantes para los backends VASP y ABACUS, además de checkpoints específicos para ocho benchmarks de dinámica molecular (Si, GaAs, InSb, InAs, GaN, LiF, Al2O3, Al) y para una bicapa de MoS2 con giro (twisted bilayer). El tamaño del repositorio es de 0,3 GB y la licencia es MIT.

Su relevancia radica en que la predicción directa de densidad de carga mediante un modelo equivariante puede sustituir o inicializar cálculos DFT costosos, reduciendo el coste computacional de flujos de estructura electrónica. La información disponible no detalla el número de parámetros, la arquitectura interna ni los resultados de benchmarks del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal sobre grafos equivariante (EdenGNN); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre estructuras atómicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | MIT |
| Formato de pesos | checkpoints `.ckpt` (formato nativo del framework de entrenamiento); no se distribuyen en safetensors ni GGUF |
| Pipeline | graph-ml |
| Tamaño del repositorio | 0,3 GB |
| Backends DFT soportados | VASP (PAW) y ABACUS (pseudopotenciales `sg15_oncv` con base de orbitales atómicos numéricos) |

## Arquitectura y entrenamiento

EdenGNN es una red neuronal sobre grafos de carácter equivariante diseñada para predecir densidades de carga a partir de estructuras atómicas. El repositorio incluye checkpoints universales entrenados sobre la base de datos de materiales no magnéticos de Materials Project, con dos variantes para VASP (modelo de pseudodensidad y modelo de ocupación por aumento) y una variante para ABACUS. Adicionalmente, se distribuyen checkpoints específicos por sistema para los ocho benchmarks de dinámica molecular y para la bicapa girada de MoS2.

La información proporcionada no incluye el número de tokens o estructuras de entrenamiento, la composición detallada del dataset, ni si se emplearon técnicas de ajuste fino por refuerzo. El autor advierte que los ficheros `config.yaml` son solo de referencia y deben adaptarse al entorno local (rutas, plantillas de software, ubicaciones de dataset, checkpoints, directorios de salida y parámetros de ejecución). La reproducibilidad depende de mantener consistentes el backend DFT, la elección de pseudopotenciales, la base ABACUS, la configuración de la malla de densidad de carga y las plantillas de entrada.

## Capacidades

- Predicción de densidad de carga electrónica a partir de estructuras atómicas.
- Predicción de ocupación por aumento (variante `aug`) en el flujo VASP.
- Integración con flujos DFT de VASP (PAW) y ABACUS.
- Modelos universales para materiales no magnéticos de Materials Project.
- Modelos específicos por sistema para benchmarks de dinámica molecular (Si, GaAs, InSb, InAs, GaN, LiF, Al2O3, Al).
- Modelo para bicapa girada de MoS2 con estructuras perturbadas aleatoriamente.
- Soporte de ajuste fino y predicción desde el repositorio de código principal.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de los modelos de lenguaje.

## Casos de uso

- Aceleración de cálculos de estructura electrónica: el modelo predice la densidad de carga directamente desde la estructura atómica, lo que permite inicializar o sustituir pasos DFT costosos en flujos VASP o ABACUS.
- Cribado de materiales no magnéticos: los checkpoints universales entrenados sobre Materials Project permiten evaluar densidades de carga de candidatos sin ejecutar DFT completo para cada estructura.
- Simulaciones de dinámica molecular: los checkpoints específicos por sistema (Si, GaAs, InSb, InAs, GaN, LiF, Al2O3, Al) se emplean en los benchmarks de MD descritos en el artículo para obtener densidades a lo largo de trayectorias.
- Estudio de materiales bidimensionales: el checkpoint de MoS2 permite predecir densidades en bicapas giradas con perturbaciones estructurales, un caso relevante para materiales correlacionados y twistrónica.
- Ajuste fino sobre datasets propios: partiendo de los checkpoints universales y de las configuraciones de referencia, se puede reentrenar el modelo con datos locales de DFT manteniendo el mismo backend y pseudopotenciales.
- Reproducción de experimentos del artículo: los checkpoints y configuraciones permiten reproducir los resultados publicados siempre que se respeten las condiciones de preparación de datos y ajustes DFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el repositorio no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se ejecuta a través del repositorio principal de EdenGNN (https://github.com/rubenlee11/EdenGNN), no mediante vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 0,3 GB, por lo que el espacio en disco necesario para los checkpoints es reducido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los ficheros `config.yaml` son solo de referencia y no funcionan sin modificaciones; deben adaptarse a rutas, plantillas, datasets y parámetros locales.
- La reproducibilidad depende de usar pseudopotenciales y bases consistentes con los empleados en el entrenamiento (especialmente en los modelos VASP PAW).
- El comportamiento del modelo depende de la configuración de la malla de densidad de carga y de los parámetros de corte.
- El modelo está diseñado para flujos EdenGNN concretos; no es un modelo autónomo ni un modelo de lenguaje.
- Solo se declara soporte de inglés en los metadatos, aunque esto es irrelevante para su tarea principal.
- No se han publicado datos de sesgos, alucinación o robustez fuera de dominio en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las dependencias del código principal y las licencias de los datos de Materials Project y de los pseudopotenciales.
- No se dispone de información sobre parámetros, arquitectura interna ni rendimiento, lo que limita la evaluación previa a su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TrueSavage/EdenGNN
- Repositorio de código principal: https://github.com/rubenlee11/EdenGNN
- Repositorio de datos asociado: https://huggingface.co/TrueSavage/EdenGNN-Data
- Artículo asociado: *Efficient equivariant framework for universal charge density prediction* (referenciado en la model card; no se proporciona URL directa en la información disponible).
