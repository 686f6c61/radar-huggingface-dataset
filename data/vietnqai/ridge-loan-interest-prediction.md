# vietnqai/ridge-loan-interest-prediction

## Resumen

`vietnqai/ridge-loan-interest-prediction` es un repositorio de código y experimentos, no un modelo generativo de lenguaje. Contiene un trabajo de la asignatura de Optimización Avanzada (clase de Ciencia de Datos) en el que se implementan desde cero cuatro algoritmos de optimización aplicados a una regresión lineal con regularización Ridge, con el objetivo de predecir el tipo de interés (`int_rate`) de préstamos del conjunto de datos Lending Club 2007-2018. El problema resuelto es la minimización de $f(w) = \frac{1}{2n}\|Xw - y\|_2^2 + \frac{\lambda}{2}\|w\|_2^2$, una función fuertemente convexa con solución cerrada.

El interés del proyecto es metodológico: al conocerse el óptimo exacto $f^*$, todas las curvas de convergencia se representan como $f(w_k) - f^*$ en escala logarítmica, lo que permite comparar de forma rigurosa descenso de gradiente completo, SGD puro con lotes de un ejemplo, mini-batch SGD y método de Newton, cada uno con paso fijo y con búsqueda de línea backtracking según la condición de Armijo. La dimensión del problema es $d = 115$ variables (116 en la variante `accepted_2007_to_2018Q4.csv.gz`) y el repositorio ocupa 1,9 GB, aunque el conjunto de datos no está incluido y debe descargarse aparte desde Kaggle.

No se trata de un modelo de pesos publicados: no hay safetensors, GGUF ni artefactos de inferencia reutilizables. Es material docente reproducible, con documentación en vietnamita y sin licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión lineal con regularización Ridge (L2); no es una red neuronal, ni un transformer, ni un modelo MoE o SSM |
| Parámetros totales | $d = 115$ coeficientes (116 en la variante `accepted_2007_to_2018Q4.csv.gz`), más el término independiente si se ajusta |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de regresión tabular, sin ventana de contexto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la documentación del repositorio está redactada en vietnamita) |
| Licencia | No disponible |
| Formato de pesos | No disponible (los artefactos intermedios se guardan en `data/processed/` y los resultados en JSON en `results/raw/`) |
| Tamaño del repositorio | 1,9 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-18T06:52:29Z |
| Última actualización | 2026-09-18T13:17:08Z |
| Etiqueta de región | `region:us` |

## Arquitectura y entrenamiento

El objeto de optimización es una regresión Ridge, es decir, un modelo lineal con penalización cuadrática sobre los pesos. La función objetivo es convexa fuerte y admite solución cerrada, lo que se aprovecha para calcular $f^*$ con precisión cercana a la de la máquina. El repositorio no «entrena» una red: ajusta un vector de pesos mediante métodos iterativos y compara su comportamiento. La matriz de diseño se construye en los notebooks `01` y `02`, donde también se selecciona el hiperparámetro $\lambda$ mediante validación cruzada de 5 particiones y se calculan la constante de Lipschitz $L$, la constante de convexidad fuerte $\mu$, el número de condición $\kappa$ y el óptimo $f^*$. A partir de ese momento los ficheros de `data/processed/` se congelan, de modo que todas las comparaciones se hagan sobre la misma función objetivo.

El diseño del código separa dos ejes ortogonales: la dirección de descenso (`direction.py`, con `SteepestDescent`, `MiniBatch` y `NewtonStep`) y la regla de paso (`stepsize.py`, con `Fixed`, `Armijo` y `Decay`), combinados en un único bucle de iteración en `iterate.py`. El producto cartesiano de ambas dimensiones se declara y ejecuta desde `experiment.py`. Los datos de partida son los préstamos concedidos de Lending Club entre 2007 y 2018, distribuidos en dos ficheros comprimidos que suman 618 MB; los préstamos rechazados se descartan porque carecen de la variable objetivo. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación, lógicamente ausentes en este tipo de modelo.

## Capacidades

- Predicción del tipo de interés (`int_rate`) de un préstamo a partir de variables tabulares del mismo, mediante regresión Ridge.
- Implementación desde cero del descenso de gradiente completo (full batch).
- Implementación de SGD puro con lotes de un único ejemplo.
- Implementación de mini-batch SGD.
- Implementación del método de Newton (segundo orden) con amortiguamiento.
- Dos reglas de paso por algoritmo: paso fijo y backtracking line search con condición de Armijo, más una regla de decaimiento (`Decay`).
- Cálculo exacto de $L$, $\mu$, $\kappa$ y $f^*$ para construir curvas de convergencia $f(w_k) - f^*$ en escala logarítmica.
- Selección de $\lambda$ por validación cruzada de 5 particiones.
- Envoltorio de referencia sobre scikit-learn (`reference.py`) para contrastar resultados.
- Generación automatizada de figuras en PDF y PNG (incluida una versión para diapositivas) a partir de los JSON de resultados, sin repetir experimentos.
- Suite de pruebas con `pytest`.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento extendido: no es un modelo de lenguaje.

## Casos de uso

- Material docente para un curso de optimización numérica: el repositorio implementa el mismo problema con cuatro algoritmos y dos reglas de paso, de modo que el alumnado puede estudiar experimentalmente la diferencia entre métodos de primer y segundo orden sobre una función con óptimo conocido.
- Comparación rigurosa de optimizadores: al fijarse $f^*$ y el número de condición $\kappa$, las curvas de error relativo permiten medir iteraciones y tiempo hasta convergencia sin ambigüedad metodológica.
- Predicción de tipos de interés en carteras de préstamos: el modelo ajustado estima `int_rate` a partir de 115 variables del préstamo, un caso típico de scoring crediticio con regularización para controlar la colinealidad entre variables financieras.
- Estudio del efecto del condicionamiento: la infraestructura permite reproducir cómo cambia la convergencia al variar $\lambda$ (y por tanto $\mu$, $L$ y $\kappa$) manteniendo el resto del experimento constante.
- Evaluación de estrategias de tamaño de lote: el eje `MiniBatch` permite medir el compromiso entre coste por iteración y progreso por iteración frente al gradiente completo y frente al lote unitario.
- Reutilización del diseño modular: la separación entre `Direction` y `StepSize` permite extrapolar la misma maquinaria de experimentación a otras funciones objetivo convexas sin reescribir el bucle de iteración.
- Verificación de implementaciones propias contra una referencia: `reference.py` envuelve scikit-learn, lo que facilita validar que los resultados propios coinciden con los de una biblioteca consolidada.
- Auditoría de reproducibilidad: los resultados se guardan como JSON por grupo de experimentos y el runner omite los grupos ya completados, lo que permite reanudar barridos largos sin recalcular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No aplican métricas típicas de modelos de lenguaje como MMLU, HumanEval o GSM8K. La métrica interna del proyecto es el error $f(w_k) - f^*$ en escala logarítmica, junto con el tiempo por iteración, pero los valores numéricos concretos no se incluyen en el material proporcionado.

Los únicos datos de rendimiento disponibles son las condiciones de medida, que se reproducen en la sección de requisitos de hardware: cualquier cifra de tiempo solo es comparable con medidas tomadas en la misma máquina y con la misma configuración de hilos BLAS.

## Requisitos de hardware

- Inferencia en CPU exclusivamente. El proyecto no requiere GPU ni VRAM; no hay despliegue con CUDA.
- Máquina de referencia declarada por el autor: Intel Core i7-14700K (8 P-core y 12 E-core) con 62 GB de RAM, Ubuntu 20.04, kernel Linux 5.15.0, x86_64.
- Entorno de software de referencia: Python 3.12.2, numpy 2.5.2 con OpenBLAS 0.3.34 (Haswell/AVX2), scipy 1.18.0, scikit-learn 1.9.0, pandas 3.0.5 y matplotlib 3.11.1.
- El runner fija 8 hilos BLAS mediante `RIDGE_BLAS_THREADS` y los ancla a los P-core físicos con `RIDGE_CPU_AFFINITY=pcores`, porque los 28 hilos por defecto de la rueda de numpy ralentizan el ensamblado del Hessiano frente a un solo hilo.
- El coste dominante no es el modelo (el Hessiano es de 115 × 115), sino la construcción de la matriz de diseño a partir de los CSV de Lending Club, que ocupan 618 MB comprimidos y no se incluyen en el repositorio, que a su vez pesa 1,9 GB.
- Opciones de despliegue: ejecución local mediante entorno virtual de Python (`python3 -m venv .venv`, `pip install -r requirements.txt`) y módulos `src.experiment` y `src.make_figures`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de proyecto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vietnqai/ridge-loan-interest-prediction` | Regresión Ridge con optimizadores propios | $d = 115$ (o 116) | No aplica | No disponible | Repositorio HuggingFace, sin pesos publicados |
| scikit-learn `Ridge` | Regresión Ridge con solver cerrado (Cholesky, SVD, LSQR) | $d$ según datos | No aplica | BSD-3-Clause (librería) | Paquete consolidado; usado como referencia dentro de este mismo repositorio |
| scikit-learn `SGDRegressor` | Regresión lineal por descenso de gradiente estocástico | $d$ según datos | No aplica | BSD-3-Clause (librería) | Paquete consolidado; equivalente funcional al eje SGD del repositorio |
| Implementaciones tipo `glmnet` | Regresión penalizada con coordenadas y regularización elástica | $d$ según datos | No aplica | No disponible en la información | No disponible en la información |

No se han identificado en la información proporcionada otros modelos o repositorios directamente comparables en HuggingFace con la misma combinación de problema (Ridge sobre Lending Club) y objetivo (comparación de optimizadores).

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de propósito general: no genera texto, no razona, no ejecuta código ni soporta herramientas. Cualquier uso en esos términos es un error de categoría.
- Licencia no declarada. Sin una licencia explícita, no se puede asumir permiso de uso comercial ni de redistribución del código.
- No se publican pesos, ni métricas de error finales, ni predicciones de referencia; el repositorio contiene código y planes, no un artefacto listo para producción.
- Toda la documentación está en vietnamita (`KE_HOACH_TRIEN_KHAI.md`, `CLAUDE.md`, `docs/van-phong-tieng-viet.md`, `docs/quy-uoc-bao-cao.md`), lo que dificulta su reutilización por parte de otros equipos.
- El conjunto de datos no está incluido: requiere descargar 618 MB desde Kaggle, con cuenta y, opcionalmente, token de API. La reproducibilidad depende de la disponibilidad de ese recurso externo.
- Sesgo de selección: solo se usan los préstamos aprobados, ya que los rechazados no tienen `int_rate`. Un modelo ajustado así no puede extrapolarse a solicitudes que no habrían sido aprobadas, y hereda los sesgos históricos de las políticas de concesión de Lending Club.
- Inconsistencia entre versiones del conjunto de datos: `loan.csv` carece de las columnas `fico_range_low` y `fico_range_high`, por lo que $d = 115$ en lugar de 116. El lector toma la intersección entre columnas necesarias y disponibles y avisa de las ausentes, pero los resultados no son estrictamente idénticos entre variantes.
- Las medidas de tiempo solo son válidas en la máquina y configuración de hilos descritas; el propio autor advierte que no son comparables con medidas tomadas en otro hardware.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de conclusiones erróneas si se comparan tiempos entre máquinas distintas o si se reutilizan los ficheros de `data/processed/` tras modificarlos, algo que el flujo de trabajo prohíbe explícitamente.
- Metadatos anómalos: las fechas de creación y actualización (2026) son posteriores a la fecha de consulta habitual, lo que conviene verificar antes de citar el repositorio.
- Cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad ni evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vietnqai/ridge-loan-interest-prediction
- Conjunto de datos Lending Club en Kaggle: https://www.kaggle.com/datasets/wordsforthewise/lending-club
- Página de configuración de API de Kaggle (para el token de descarga): https://www.kaggle.com/settings
- Ficheros referenciados dentro del repositorio (rutas relativas, sin URL absoluta disponible): `KE_HOACH_TRIEN_KHAI.md`, `CLAUDE.md`, `docs/van-phong-tieng-viet.md`, `docs/quy-uoc-bao-cao.md`, `requirements.txt`, `src/objective.py`, `src/direction.py`, `src/stepsize.py`, `src/iterate.py`, `src/experiment.py`, `src/reference.py`, `src/figures.py`, `src/make_figures.py`
- Artículos, papers o demos adicionales: no disponibles
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos corresponden al software francés de gestión de comunidades de propietarios Coprolib' (https://www.coprolib.com/ y sus subpáginas) y no guardan relación con este repositorio.
